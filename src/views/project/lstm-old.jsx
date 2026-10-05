import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card } from "primereact/card";
import { HistoryModel } from "../../models";

const historyModel = new HistoryModel();

/* -------------------- Utils -------------------- */

// กำหนดว่าวันใดถือเป็น “วันหยุด” (ใช้สำหรับ boost forecast)
const WEEKEND = ["Fri", "Sat", "Sun"];

// แปลงวันที่ 2025-12-21 → "Sun" ใช้เพื่อแยก weekday / weekend
const getDayName = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });

const groupByProduct = (history) => {
  const map = {};
  history.forEach(h => {
    if (!map[h.product_table_uuid]) map[h.product_table_uuid] = [];
    map[h.product_table_uuid].push(h);
  });
  return map;
};

const generateNextDays = (days) => {
  const list = [];
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    list.push(d);
  }
  return list;
};

// ดึงค่าเฉลี่ย weekday / weekend
// Loop วันที่ในอนาคต
// ถ้าเป็น ศ–ส–อา → ใช้ weekendAvg
// ถ้าเป็นวันธรรมดา → ใช้ weekdayAvg
// ใส่ trend โตขึ้นทุกสัปดาห์ (+3%)
const forecastWithWeekend = (history, days = 14) => {
  const { weekdayAvg, weekendAvg } = averageByType(history);

  return generateNextDays(days).map((d, i) => {
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    const isWeekend = WEEKEND.includes(day);

    // วันหยุดแรงกว่า
    let base = isWeekend ? weekendAvg : weekdayAvg;

    // ถ้า data ยังน้อย fallback
    if (!base) base = weekdayAvg || weekendAvg || 0;

    // trend โตตามเวลา
    const trend = 1 + 0.03 * Math.floor(i / 7);

    return {
      date: d.toISOString().slice(0, 10),
      day,
      isWeekend,
      forecast: Math.ceil(base * trend),
    };
  });
};

// ป้องกันยอดเท่ากัน ระหว่าง 0-7 วัน และ 0-14 วัน
const applyTrend = (forecast, growthRate = 0.03) =>
  forecast.map((f, i) => ({
    ...f,
    forecast: Math.ceil(
      f.forecast * (1 + growthRate * Math.floor(i / 7))
    ),
  }));

const recommendStock = (forecast, bufferRate = 0.2, minOrder = 20) => {
  const total = forecast.reduce((s, f) => s + f.forecast, 0);
  const order = Math.ceil(total * (1 + bufferRate));
  return order < minOrder ? minOrder : order;
};

// วิเคราะห์ยอดขายย้อนหลัง
const averageByType = (history) => {
  const weekday = [];
  const weekend = [];

  history.forEach(h => {
    const day = getDayName(h.added_date);
    const qty = Number(h.count || 0);

    if (WEEKEND.includes(day)) {
      weekend.push(qty);
    } else {
      weekday.push(qty);
    }
  });

  return {
    weekdayAvg: weekday.length
      ? weekday.reduce((s, v) => s + v, 0) / weekday.length
      : 0,
    weekendAvg: weekend.length
      ? weekend.reduce((s, v) => s + v, 0) / weekend.length
      : 0,
  };
};


/* -------------------- Component -------------------- */

const SalesForecast = () => {
  const [productsForecast, setProductsForecast] = useState({});
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await historyModel.getHistoryBy();
      const history = res.data || [];
      if (!history.length) return;

      const grouped = groupByProduct(history);
      const result = {};

      Object.keys(grouped).forEach(pid => {
        const raw14 = forecastWithWeekend(grouped[pid], 14);
        const forecast14 = applyTrend(raw14);

        const f7 = forecast14.slice(0, 7);
        const f14 = forecast14.slice(7, 14);

        result[pid] = {
          name: grouped[pid][0].product_name,
          forecast7: f7,
          forecast14: f14,
          order7: recommendStock(f7, 0.2),
          order14: recommendStock(f14, 0.35),
        };
      });

      setProductsForecast(result);

      // ใช้สินค้าตัวแรกโชว์กราฟ
      const first = Object.values(result)[0];
      if (!first) return;

      const all = [...first.forecast7, ...first.forecast14];

      const productList = Object.values(result);

      // ใช้ forecast 14 วันจากสินค้าตัวแรกเป็นแกน X
      const categories = [
        ...productList[0].forecast7,
        ...productList[0].forecast14,
      ].map(f => f.day);

      // สร้าง series หลายเส้น
      const series = productList.map(p => ({
        name: p.name,
        data: [...p.forecast7, ...p.forecast14].map(f => f.forecast),
      }));

      setChartData({ categories, series });
    };

    load();
  }, []);

  // สร้าง discrete markers สำหรับวันหยุด (ศ–ส–อา)
  const weekendMarkers = [];

  chartData?.categories?.forEach((day, dataPointIndex) => {
    if (["Fri", "Sat", "Sun"].includes(day)) {
      chartData.series.forEach((_, seriesIndex) => {
        weekendMarkers.push({
          seriesIndex,
          dataPointIndex,
          fillColor: "#EF4444",
          strokeColor: "#EF4444",
          size: 6,
        });
      });
    }
  });

  const chartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
    },

    // เส้นโค้ง ดูเป็น trend มากกว่าเส้นตรง
    stroke: {
      curve: "smooth",
      width: 3,
    },

    // marker ปกติ (วันธรรมดา)
    markers: {
      size: 4,
      discrete: weekendMarkers, // 🔴 override เฉพาะวันหยุด
    },

    xaxis: {
      categories: chartData?.categories || [],
      title: {
        text: "วัน",
      },
    },

    legend: {
      position: "top",
      horizontalAlign: "left",
    },

    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `${val} ขวด`,
      },
    },

    // เส้นแบ่ง 7 วันแรก
    annotations: {
      xaxis: chartData?.categories?.[6]
        ? [
          {
            x: chartData.categories[6],
            borderColor: "#F97316",
            strokeDashArray: 4,
            label: {
              text: "7 วันแรก",
              style: {
                background: "#F97316",
                color: "#fff",
                fontSize: "12px",
              },
            },
          },
        ]
        : [],
    },
  };


  const weekendRatio = (forecast = []) => {
    if (!forecast.length) return 0;

    const weekendTotal = forecast
      .filter(f => f.isWeekend)
      .reduce((s, f) => s + f.forecast, 0);

    const total = forecast.reduce((s, f) => s + f.forecast, 0);

    return total ? Math.round((weekendTotal / total) * 100) : 0;
  };

  const weekendContribution = (forecast = []) => {
    return forecast
      .filter(f => f.isWeekend)
      .reduce((s, f) => s + f.forecast, 0);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        คาดการณ์การขาย (รองรับวันหยุด ศ–ส–อา)
      </h1>

      <div className="flex flex-col lg:flex-row gap-4">

        {/* ซ้าย: Chart */}
        <div className="w-full lg:w-[70%]">
          <Card className="p-4">
            {chartData && (
              <Chart
                options={chartOptions}
                series={chartData.series}
                type="line"
                height={560}
              />
            )}
          </Card>
        </div>

        {/* ขวา: Stock Recommendation */}
        <div className="w-full lg:w-[30%] space-y-4">
          {Object.values(productsForecast).map((p, i) => (
            <Card key={i} className=" bg-green-50 border border-green-200">
              <h2 className="font-semibold mb-3">{p.name}</h2>

              <div className="flex justify-between mb-2">
                <span className="text-sm">ควรสั่งเพิ่ม (0–7 วัน)</span>
                <span className="font-bold text-green-700">
                  {p.order7} ขวด
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                • ช่วง 0–7 วัน: วันหยุด ~
                <span className="font-medium text-gray-800">
                  {weekendRatio(p.forecast7)}%
                </span>
                {" "}≈{" "}
                <span className="font-semibold text-red-600">
                  {weekendContribution(p.forecast7)} ขวด
                </span>
              </p>

              <div className="flex justify-between pt-2 border-t mt-2">
                <span className="text-sm">ควรสั่งเพิ่ม (7–14 วัน)</span>
                <span className="font-bold text-blue-700">
                  {p.order14} ขวด
                </span>
              </div>
              <p className="text-xs text-gray-600">
                • ช่วง 7–14 วัน: วันหยุด ~
                <span className="font-medium text-gray-800">
                  {weekendRatio(p.forecast14)}%
                </span>
                {" "}≈{" "}
                <span className="font-semibold text-red-600">
                  {weekendContribution(p.forecast14)} ขวด
                </span>
              </p>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SalesForecast;
