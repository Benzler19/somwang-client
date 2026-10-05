import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import Chart from "chart.js/auto";
import TopProducts from "./top-products";
import { ProductModel } from "../../models";
import { ColorPicker } from "primereact/colorpicker";

const product_model = new ProductModel()

const Dashboard = () => {
  const barRef = useRef(null);
  const donutRef = useRef(null);
  const barChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const [state, setState] = useState({
    out_of_stock: [],
  })

   const _fetchData = async () => {
    let data = await product_model.getProductOutOfStock();

    setState({
      ...state,
      out_of_stock: data.data,
    });
  };

  useEffect(() => {
    _fetchData();
    const barCtx = barRef.current.getContext("2d");
    barChartRef.current = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
        datasets: [
          {
            label: "series-1",
            data: [30, 40, 45, 50, 49, 60, 70, 91],
            backgroundColor: "oklch(74% 0.238 322.16)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });

    const donutCtx = donutRef.current.getContext("2d");
    donutChartRef.current = new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: ["เบียร์ช้าง","เบียร์สิงห์","เบียร์ลีโอ",],
        datasets: [
          {
            data: [44, 55, 41],
            backgroundColor: [
              "#60A5FA",
              "#34D399",
              "#F59E0B",
            ,
            ],  
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });

    return () => {
      barChartRef.current?.destroy();
      donutChartRef.current?.destroy();
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <div className="flex mb-4">
        <div className="stats w-full shadow grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat p-4 bg-white rounded-lg">
            <div className="stat-figure text-secondary"></div>
            <div className="stat-title text-gray-600">เบียร์ช้าง</div>
            <div className="stat-value text-2xl font-bold"></div>
          </div>
          <div className="stat p-4 bg-white rounded-lg">
            <div className="stat-figure text-secondary"></div>
            <div className="stat-title text-gray-600">เบียร์ลีโอ</div>
            <div className="stat-value text-2xl font-bold"></div>
          </div>
          <div className="stat p-4 bg-white rounded-lg">
            <div className="stat-figure text-secondary"></div>
            <div className="stat-title text-gray-600">เบียร์สิงห์</div>
            <div className="stat-value text-2xl font-bold"></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Card>
            <div className="flex justify-center text-center flex-col">
              <i className="pi pi-bell text-5xl animate-bounce text-red-500"></i>
              <p>สินค้าใกล้หมดสต็อก</p>
              {state.out_of_stock?.map((item, idx) => {
                return (
                  <div key={idx} className="flex items-center justify-evenly">
                    <div>{item.product_name}</div>
                    <div>สินค้าในสต็อก: {item.num} ขวด</div>
                    </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:flex-2 flex-1">
          <Card className="w-full p-4 bg-white shadow-lg min-h-[320px]">
            <h2 className="mb-2 font-semibold">ยอดขาย</h2>
            <div className="w-full h-64">
              <canvas ref={barRef} />
            </div>
          </Card>
        </div>

        <div className="lg:flex-1 flex-1">
          <Card className="w-full p-4 bg-white shadow-lg min-h-[320px]">
            <h2 className="mb-2 font-semibold">ประเภทการขาย</h2>
            <div className="w-full h-64 flex items-center justify-center">
              <canvas ref={donutRef} style={{ maxWidth: "320px" }} />
            </div>
          </Card>
        </div>

        <div className="w-full lg:w-80">
          <TopProducts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
