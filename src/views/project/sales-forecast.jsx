import React, { useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import Chart from "chart.js/auto";

const mockHistorical = [120, 150, 170, 160, 180, 200, 220, 210, 230, 250, 240, 260];
const mockForecast = [270, 285, 300];
const labels = [
  "2024-01",
  "2024-02",
  "2024-03",
  "2024-04",
  "2024-05",
  "2024-06",
  "2024-07",
  "2024-08",
  "2024-09",
  "2024-10",
  "2024-11",
  "2024-12",
  "2025-01",
  "2025-02",
  "2025-03",
];

// simple accuracy metrics from mock (compare last 3 historical vs forecast)
const calcMetrics = (actual, pred) => {
  // take last n actuals where n = pred.length
  const n = pred.length;
  const actualSlice = actual.slice(-n);
  const errors = actualSlice.map((a, i) => a - pred[i]);
  const absErrors = errors.map((e) => Math.abs(e));
  const mae = absErrors.reduce((s, v) => s + v, 0) / n;
  const rmse = Math.sqrt(errors.reduce((s, v) => s + v * v, 0) / n);
  const mape = (
    absErrors.reduce((s, v, i) => s + (v / (actualSlice[i] || 1)), 0) / n
  ) * 100;
  return { mae: mae.toFixed(2), rmse: rmse.toFixed(2), mape: mape.toFixed(2) };
};

const SalesForecast = () => {
  const [metrics, setMetrics] = useState({ mae: "-", rmse: "-", mape: "-" });
  const lineRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const allData = [...mockHistorical, ...mockForecast];
    const ctx = lineRef.current.getContext("2d");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "ยอดดขายจริง",
            data: [...mockHistorical, ...new Array(mockForecast.length).fill(null)],
            borderColor: "#2563EB",
            backgroundColor: "rgba(37,99,235,0.08)",
            tension: 0.2,
            pointRadius: 3,
          },
          {
            label: "การคาดการณ์ยอดขาย",
            data: [
              ...new Array(mockHistorical.length).fill(null),
              ...mockForecast,
            ],
            borderColor: "#F97316",
            backgroundColor: "rgba(249,115,22,0.06)",
            borderDash: [6, 4],
            tension: 0.2,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: false },
        },
        plugins: {
          legend: { position: "top" },
        },
      },
    });

    // compute metrics comparing last actuals to mockForecast (for demo)
    setMetrics(calcMetrics(mockHistorical, mockForecast));

    // try to fetch LSTM forecast from backend (if available)
    const fetchLstm = async () => {
      try {
        const res = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ forecast_periods: 3 }),
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.forecast) {
          // update chart datasets: replace forecast dataset values
          const forecast = json.forecast;
          // update data in chart instance
          chartRef.current.data.datasets[1].data = [
            ...new Array(mockHistorical.length).fill(null),
            ...forecast,
          ];
          chartRef.current.update();
          setMetrics(json.metrics || {});
        }
      } catch (e) {
        // ignore if backend not running
        console.warn("LSTM backend not available:", e.message);
      }
    };
    fetchLstm();

    return () => chartRef.current?.destroy();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">คาดการณ์การขาย (Sales Forecast)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <Card className="w-full p-4 bg-white shadow-lg min-h-[360px]">
            <h2 className="mb-2 font-semibold">กราฟการขายจริงและการคาดการณ์</h2>
            <div className="w-full h-72">
              <canvas ref={lineRef} />
            </div>
          </Card>
        </div>

        <div>
          <Card className="w-full p-4 bg-white shadow-lg">
            <h2 className="mb-2 font-semibold">ตารางความแม่นยำ (Accuracy)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">เมตริก</th>
                  <th className="py-2">ค่า</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">MAE</td>
                  <td className="py-2 font-medium">{metrics.mae}</td>
                </tr>
                <tr>
                  <td className="py-2">RMSE</td>
                  <td className="py-2 font-medium">{metrics.rmse}</td>
                </tr>
                <tr>
                  <td className="py-2">MAPE (%)</td>
                  <td className="py-2 font-medium">{metrics.mape}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 text-xs text-gray-500">
              ข้อมูลเป็นตัวอย่าง หากต้องการเชื่อมต่อข้อมูลจริง ให้เชื่อม API เพื่อดึงข้อมูลประวัติการขาย
            </div>
          </Card>
        </div>
      </div>

      <div className="card bg-white p-4 shadow-lg">
        <h3 className="font-semibold mb-2">รายละเอียดการคาดการณ์</h3>
        <p className="text-sm text-gray-600">โมเดลที่ใช้: ตัวอย่าง mock forecast (เท่าที่แสดงด้านบน)</p>
        <p className="text-sm text-gray-600">สามารถเพิ่มตัวเลือกโมเดล เช่น ARIMA, Prophet, LSTM และแสดงตารางความแม่นยำแยกตามโมเดลได้</p>
      </div>
    </div>
  );
};

export default SalesForecast;
