import React, { useState, useEffect, useRef } from "react";
import { Card, Dropdown } from "primereact";
import Chart from "chart.js/auto";
import TopProducts from "./top-products";
import { ProductModel, HistoryModel } from "../../models";
import { ColorPicker } from "primereact/colorpicker";
import ReactApexChart from "react-apexcharts";

const product_model = new ProductModel()
const history_model = new HistoryModel();

const Dashboard = () => {
  const [state, setState] = useState({
    out_of_stock: [],
  })
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  const _fetchData = async () => {
    let data = await product_model.getProductOutOfStock();
    const history_sales = await history_model.getHistorySalesBy();
    const history_add = await history_model.getHistoryBy();
    console.log('history_add :>> ', history_add);
    setState({
      ...state,
      out_of_stock: data.data,
      history_sales: history_sales.data,
      history: history_add.data,
    });
  };

  useEffect(() => {
    _fetchData();

  }, []);

  const monthOptions = [
    { label: "ทุกเดือน", value: "ALL" },
    ...Array.from(
      new Set(state.history_sales?.map((i) => i.bill_month))
    ).map((m) => ({ label: m, value: m })),
  ];

  const filteredSales =
    selectedMonth === "ALL"
      ? state.history_sales
      : state.history_sales?.filter(
        (i) => i.bill_month === selectedMonth
      );


  const totalSales = state.history_sales?.reduce(
    (sum, i) => sum + Number(i.total_amount || 0),
    0
  );

  const totalCount = state.history_sales?.reduce(
    (sum, i) => sum + Number(i.total_count || 0),
    0
  );

  const monthMap = {};
  (state.history_sales || []).forEach((i) => {
    monthMap[i.bill_month] =
      (monthMap[i.bill_month] || 0) + Number(i.total_amount);
  });

  const monthCategories = Object.keys(monthMap);
  const monthSeries = Object.values(monthMap);

  const productMap = {};
  (state.history_sales || []).forEach((i) => {
    productMap[i.product_name] =
      (productMap[i.product_name] || 0) + Number(i.total_amount);
  });

  const donutLabels = Object.keys(productMap);
  const donutSeries = Object.values(productMap);

  const inMap = {};
  (state.history || []).forEach((i) => {
    const month = i.added_date?.slice(0, 7);
    inMap[month] = (inMap[month] || 0) + Number(i.count);
  });

  const outMap = {};
  (state.history_sales || []).forEach((i) => {
    outMap[i.bill_month] =
      (outMap[i.bill_month] || 0) + Number(i.total_count);
  });

  const months = Array.from(
    new Set([...Object.keys(inMap), ...Object.keys(outMap)])
  ).sort();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 shadow-sm">
          <p className="text-sm text-gray-500">ยอดขายรวม</p>
          <p className="text-2xl font-bold text-green-600">
            ฿ {totalSales?.toLocaleString()}
          </p>
        </Card>

        <Card className="bg-blue-50 shadow-sm">
          <p className="text-sm text-gray-500">จำนวนที่ขาย</p>
          <p className="text-2xl font-bold text-blue-600">
            {totalCount} ขวด
          </p>
        </Card>

        <Card className="bg-yellow-50 shadow-sm">
          <p className="text-sm text-gray-500">สินค้า</p>
          <p className="text-2xl font-bold">
            {filteredSales?.length || 0}
          </p>
        </Card>

        <Card className="bg-red-50 shadow-sm">
          <p className="text-sm text-gray-500">ใกล้หมด</p>
          <p className="text-2xl font-bold text-red-600">
            {state.out_of_stock?.length || 0}
          </p>
        </Card>
      </div>


      <div>
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="font-semibold">เลือกเดือน</span>
            <Dropdown
              value={selectedMonth}
              options={monthOptions}
              onChange={(e) => setSelectedMonth(e.value)}
              className="w-52"
            />
          </div>
        </Card>
        <div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <Card className="xl:col-span-2">
            <h3 className="font-semibold mb-2">ยอดขายรายเดือน</h3>
            <ReactApexChart
              type="bar"
              height={300}
              series={[
                {
                  name: "ยอดขาย (บาท)",
                  data: monthSeries,
                },
              ]}
              options={{
                chart: {
                  toolbar: { show: false },
                },
                xaxis: {
                  categories: monthCategories,
                  title: {
                    text: "เดือน",
                    style: {
                      fontSize: "14px",
                      fontWeight: 600,
                    },
                  },
                },
                yaxis: {
                  title: {
                    text: "ยอดขาย (บาท)",
                    style: {
                      fontSize: "14px",
                      fontWeight: 600,
                    },
                  },
                  labels: {
                    formatter: (val) => `฿ ${val.toLocaleString()}`,
                  },
                },
                colors: ["#16a34a"],
                dataLabels: { enabled: false },
                tooltip: {
                  y: {
                    formatter: (val) => `฿ ${val.toLocaleString()}`,
                  },
                },
              }}
            />

          </Card>

          <Card>
            <h3 className="font-semibold mb-2">ยอดขายตามสินค้า</h3>
            <ReactApexChart
              type="donut"
              height={300}
              series={donutSeries}
              options={{
                labels: donutLabels,
                legend: { position: "bottom" },
              }}
            />
          </Card>
          {/* <Card>
            <h3 className="font-semibold mb-2">Stock In / Out</h3>
            <ReactApexChart
              type="line"
              height={320}
              series={[
                { name: "เติมสต๊อก", data: months.map((m) => inMap[m] || 0) },
                { name: "ขายออก", data: months.map((m) => outMap[m] || 0) },
              ]}
              options={{
                xaxis: { categories: months },
                colors: ["#2563eb", "#dc2626"],
                stroke: { curve: "smooth" },
              }}
            />
          </Card> */}

        </div>


      </div>



    </div>
  );
};

export default Dashboard;
