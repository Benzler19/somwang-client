import React, { useEffect, useState, useMemo } from "react";
import * as tf from "@tensorflow/tfjs";
import Chart from "react-apexcharts";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { HistoryModel } from "../../models";

const historyModel = new HistoryModel();

const SalesForecastLSTM = () => {
  const [loading, setLoading] = useState(true);
  const [forecastResults, setForecastResults] = useState([]);
  const [range, setRange] = useState("7"); // "7" | "14"

  /* ------------------ Utils ------------------ */

  const preprocessData = (data) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    return {
      normalized: data.map((v) => (v - min) / (max - min || 1)),
      min,
      max,
    };
  };

  const createModel = () => {
    const model = tf.sequential();
    model.add(
      tf.layers.lstm({
        units: 20,
        inputShape: [WINDOW, 1],
      }),
    );
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: "adam", loss: "meanSquaredError" });
    return model;
  };

  const isHoliday = (date) => {
    const day = date.getDay(); // 0=Sun
    return day === 5 || day === 6 || day === 0;
  };

  const summarize = (dates, data) => {
    let total = 0;
    let holiday = 0;

    dates.forEach((d, i) => {
      total += data[i];
      if (isHoliday(d)) holiday += data[i];
    });

    return {
      total,
      holiday,
      percent: total ? Math.round((holiday / total) * 100) : 0,
    };
  };

  const WINDOW = 7;
  const FUTURE_DAYS = 14;
  const grouped = {};

  const futureDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: FUTURE_DAYS }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i + 1);
      return d;
    });
  }, []);

  const holidayAnnotations = futureDates
    .map((d) =>
      isHoliday(d)
        ? {
            x: d.toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "short",
            }),
            borderColor: "#f59e0b",
            label: {
              text: "วันหยุด",
              style: {
                background: "#f59e0b",
                color: "#fff",
              },
            },
          }
        : null,
    )
    .filter(Boolean);

  const holidayIndexes = futureDates
    .map((d, i) => (isHoliday(d) ? i : null))
    .filter((v) => v !== null);

  /* ------------------ Effect ------------------ */

useEffect(() => {
  const run = async () => {
    const res = await historyModel.getHistoryBy();
    const raw = res.data || [];

    if (!raw.length) {
      setLoading(false);
      return;
    }

    /* ------------------ 1. clean + group ------------------ */

    const grouped = {};

    raw.forEach((r) => {
      const pid = r.product_table_uuid;
      const date = r.added_date;

      if (!grouped[pid]) grouped[pid] = { name: r.product_name, byDate: {} };

      // ✅ รวมยอดต่อวัน
      grouped[pid].byDate[date] =
        (grouped[pid].byDate[date] || 0) + Number(r.count || 0);
    });

    /* ------------------ 2. prepare dates ------------------ */

    const allDates = Object.values(grouped)
      .flatMap((p) => Object.keys(p.byDate))
      .sort();

    const results = [];

    /* ------------------ 3. per product ------------------ */

    for (const pid of Object.keys(grouped)) {
      const { name, byDate } = grouped[pid];

      // เติมวันหาย
      const sales = allDates.map((d) => byDate[d] ?? 0);

      let forecast = [];

      /* ------------------ 4. กรณีข้อมูลน้อย ------------------ */
      if (sales.length <= WINDOW) {
        const avg = Math.ceil(
          sales.reduce((s, v) => s + v, 0) / (sales.length || 1),
        );
        forecast = Array(FUTURE_DAYS).fill(avg);
      } else {
        /* ------------------ 5. normalize ------------------ */
        const { normalized, min, max } = preprocessData(sales);

        const x = [];
        const y = [];

        for (let i = 0; i + WINDOW < normalized.length; i++) {
          x.push(normalized.slice(i, i + WINDOW).map((v) => [v]));
          y.push([normalized[i + WINDOW]]);
        }

        if (x.length === 0) {
          const avg = Math.ceil(
            sales.reduce((s, v) => s + v, 0) / sales.length,
          );
          forecast = Array(FUTURE_DAYS).fill(avg);
        } else {
          const xs = tf.tensor3d(x);
          const ys = tf.tensor2d(y);

          const model = createModel();
          await model.fit(xs, ys, { epochs: 40, verbose: 0 });

          xs.dispose();
          ys.dispose();

          /* ------------------ 6. forecast ------------------ */
          let input = normalized.slice(-WINDOW).map((v) => [v]);

          for (let i = 0; i < FUTURE_DAYS; i++) {
            const t = tf.tensor3d([input]);
            const p = model.predict(t).dataSync()[0];
            t.dispose();

            const pSafe = Math.min(1, Math.max(0, p));
            let value = Math.ceil(pSafe * (max - min) + min);

            // 🔥 ปรับวันหยุด
            if (isHoliday(futureDates[i])) {
              value = Math.ceil(value * 1.25);
            }

            forecast.push(value);
            input = [...input.slice(1), [pSafe]];
          }
        }
      }

      results.push({
        product: name,
        forecast,
        summary7: summarize(
          futureDates.slice(0, 7),
          forecast.slice(0, 7),
        ),
        summary14: summarize(
          futureDates.slice(7, 14),
          forecast.slice(7, 14),
        ),
      });
    }

    setForecastResults(results);
    setLoading(false);
  };

  run();
}, []);



  /* ------------------ Chart ------------------ */

  const chartOptions = {
    xaxis: {
      categories: futureDates.map((d) =>
        d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" }),
      ),
      title: { text: "วันที่คาดการณ์" },
    },
    yaxis: {
      title: { text: "ยอดขาย (ขวด)" },
    },
    annotations: {
      xaxis: holidayAnnotations,
    },
    markers: {
      size: 5,
      discrete: holidayIndexes.map((i) => ({
        dataPointIndex: i,
        fillColor: "#f59e0b",
        strokeColor: "#f59e0b",
        size: 7,
      })),
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const dateObj = futureDates[dataPointIndex];
        const dateLabel = dateObj.toLocaleDateString("th-TH", {
          weekday: "long",
          day: "2-digit",
          month: "short",
        });

        const qty = series[seriesIndex][dataPointIndex];

        const delta =
          dataPointIndex > 0
            ? qty - series[seriesIndex][dataPointIndex - 1]
            : 0;

        const isUp = delta > 0;
        const isDown = delta < 0;

        return `
      <div style="padding:10px; min-width:180px">
        <b>${dateLabel}</b><br/>
        ยอดคาดการณ์: <b>${qty.toLocaleString()}</b> ขวด<br/>
        ${
          dataPointIndex > 0
            ? `
              เปลี่ยนจากเมื่อวาน:
              <span style="color:${isUp ? "#16a34a" : isDown ? "#dc2626" : "#666"}">
                ${isUp ? "▲" : isDown ? "▼" : "–"}
                ${Math.abs(delta).toLocaleString()}
              </span> ขวด
            `
            : `<span style="color:#999">วันแรกของการพยากรณ์</span>`
        }
      </div>
    `;
      },
    },
  };

  const chartSeries = forecastResults.map((r) => ({
    name: r.product,
    data: r.forecast,
  }));

  /* ------------------ Render ------------------ */

  return (
    <>
      <Card title="LSTM AI Sales Forecast">
        {loading ? (
          <p>AI กำลังประมวลผลโมเดล...</p>
        ) : (
          <Chart
            type="line"
            height={350}
            options={chartOptions}
            series={chartSeries}
          />
        )}
      </Card>

      <div className="flex mt-2 p-2">
        {forecastResults.map((r) => {
          const summary =
            range === "7"
              ? summarize(futureDates.slice(0, 7), r.forecast.slice(0, 7))
              : summarize(futureDates.slice(7, 14), r.forecast.slice(7, 14));

          return (
            <div key={r.product} className="mr-2">
              <Card title={r.product} className="w-[22rem] bg-emerald-50">
                <div className="flex gap-2 mb-2">
                  <button
                    className={range === "7" ? "font-bold" : ""}
                    onClick={() => setRange("7")}
                  >
                    0–7 วัน
                  </button>
                  <button
                    className={range === "14" ? "font-bold" : ""}
                    onClick={() => setRange("14")}
                  >
                    7–14 วัน
                  </button>
                </div>

                <h2 className="text-2xl font-bold">
                  {summary.total.toLocaleString()} ขวด
                </h2>

                <small>
                  • วันหยุด ~{summary.percent}% ≈{" "}
                  {summary.holiday.toLocaleString()} ขวด
                </small>
              </Card>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SalesForecastLSTM;
