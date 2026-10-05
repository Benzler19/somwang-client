import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import Chart from "chart.js/auto";
import TopProducts from "./top-products";
import { ProductModel, HistoryModel } from "../../models";
import { ColorPicker } from "primereact/colorpicker";

const product_model = new ProductModel()
const history_model = new HistoryModel();

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
    const history_sales = await history_model.getHistorySalesBy();
    const history = await history_model.getHistoryBy();

    setState({
      ...state,
      out_of_stock: data.data,
      history_sales: history_sales.data,
      history: history.data,
    });
  };

  useEffect(() => {
    _fetchData();

  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

    </div>
  );
};

export default Dashboard;
