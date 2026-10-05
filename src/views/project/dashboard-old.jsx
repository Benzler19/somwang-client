import React, { useState, useEffect, useMemo } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import Chart from "react-apexcharts";

import { ProductModel, StockModel } from "../../models";

const product_model = new ProductModel();
const stock_model = new StockModel();

const Dashboard = () => {
  const [state, setState] = useState({
    out_of_stock: [],
    stock: [],
  });

  const [selectedMonth, setSelectedMonth] = useState(null);

  /* ================= HELPER ================= */
  const getMonth = (date) => {
    if (!date) return null;
    if (typeof date === "string") return date.slice(0, 7);
    if (date instanceof Date) return date.toISOString().slice(0, 7);
    return null;
  };

  /* ================= FETCH DATA ================= */
  const _fetchData = async () => {
    const productRes = await product_model.getProductOutOfStock();
    const stockRes = await stock_model.getStockStatusCheckBillBy();

    const stockData = stockRes?.data || [];

    setState({
      out_of_stock: productRes?.data || [],
      stock: stockData,
    });

    // ตั้งค่าเดือนเริ่มต้นจากข้อมูลจริง
    if (stockData.length > 0) {
      const months = Array.from(
        new Set(
          stockData
            .filter(i => i.create_date)
            .map(i => getMonth(i.create_date))
        )
      )
        .sort()
        .reverse();

      setSelectedMonth(months[0]);
    }
  };

  useEffect(() => {
    _fetchData();
  }, []);

  /* ================= MONTH OPTIONS ================= */
  const monthOptions = useMemo(() => {
    return Array.from(
      new Set(
        state.stock
          .filter(i => i.create_date)
          .map(i => getMonth(i.create_date))
      )
    )
      .sort()
      .reverse()
      .map(m => ({ label: m, value: m }));
  }, [state.stock]);

  /* ================= PROMOTION CHART ================= */
  const promotionChartData = useMemo(() => {
    if (!selectedMonth) return { categories: [], series: [] };

    const map = {};

    state.stock.forEach(item => {
      if (!item.create_date) return;
      if (getMonth(item.create_date) !== selectedMonth) return;

      // ✔ promotion เท่านั้น
      if (!item.promotion_name) return;
      if (item.stock_count == null) return;

      const name = item.promotion_name;
      const qty = Number(item.stock_count);

      map[name] = (map[name] || 0) + qty;
    });

    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

    return {
      categories: sorted.map(i => i[0]),
      series: sorted.map(i => i[1]),
    };
  }, [state.stock, selectedMonth]);

  /* ================= TOP PRODUCTS ================= */
  const topProducts = useMemo(() => {
    if (!selectedMonth) return [];

    const map = {};

    state.stock.forEach(item => {
      if (!item.create_date) return;
      if (getMonth(item.create_date) !== selectedMonth) return;

      // ❌ ไม่เอา promotion
      if (item.promotion_name) return;

      // ✔ ต้องมีชื่อสินค้า
      if (!item.product_name) return;
      if (item.stock_count == null) return;

      const name = item.product_name;
      const qty = Number(item.stock_count);

      map[name] = (map[name] || 0) + qty;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [state.stock, selectedMonth]);

  /* ================= CHART OPTIONS ================= */
  const chartOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
      },
    },
    dataLabels: { enabled: true },
    xaxis: {
      categories: promotionChartData.categories,
      labels: { rotate: -30 },
    },
    yaxis: {
      title: { text: "จำนวนที่ขาย" },
    },
    tooltip: {
      y: {
        formatter: val => `${val} ขวด`,
      },
    },
  };

  const chartSeries = [
    {
      name: "ยอดขาย",
      data: promotionChartData.series,
    },
  ];

  /* ================= RENDER ================= */
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      {/* ===== MONTH FILTER ===== */}
      <Dropdown
        value={selectedMonth}
        options={monthOptions}
        onChange={(e) => setSelectedMonth(e.value)}
        placeholder="เลือกเดือน"
        className="w-48 mb-4"
      />

      <div className="flex flex-col lg:flex-row gap-4">
        {/* ===== PROMOTION CHART ===== */}
        <div className="lg:flex-[2] flex-1">
          <Card className="w-full p-4 min-h-[320px]">
            <h2 className="mb-3 font-semibold">
              โปรโมชันขายดีที่สุด (ประจำเดือน)
            </h2>

            {promotionChartData.series.length === 0 ? (
              <p className="text-center text-gray-400 mt-20">
                ไม่มีข้อมูลในเดือนนี้
              </p>
            ) : (
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={260}
              />
            )}
          </Card>
        </div>

        {/* ===== TOP PRODUCTS ===== */}
        <div className="w-full lg:w-80">
          <Card>
            <h3 className="font-semibold mb-3">
              สินค้าขายดีประจำเดือน
            </h3>

            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-center">
                ไม่มีข้อมูล
              </p>
            ) : (
              <ul className="space-y-2">
                {topProducts.map(([name, qty], index) => (
                  <li
                    key={name}
                    className="flex justify-between items-center"
                  >
                    <span className="truncate">
                      {index + 1}. {name}
                    </span>
                    <span className="font-semibold">
                      {qty}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
