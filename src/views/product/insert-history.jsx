import React, { useState, useEffect } from "react";
import { Button, InputText, Dropdown } from "primereact";
import { ProductModel, HistoryModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

const product_model = new ProductModel();
const history_model = new HistoryModel();
let user_data = localStorage.getItem("session-user");
const { firstname, lastname } = JSON.parse(user_data);

const Insert = () => {
  const [state, setState] = useState({
    name: "",
    count: "",
    product_name: "",
    price: "",
    create_by: firstname + " " + lastname,
    added_date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();

  const fetchData = async () => {
    try {
      const product = await product_model.getProductBy();
      setState({
        ...state,
        product: product?.data,
      });
    } catch (err) {
      console.error("Failed to load", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInput = (e, name) => {
    let updateState = { ...state };
    updateState[name] = e;
    setState(updateState);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const insert_history = {
      product_table_uuid: state.product_table_uuid || null,
      product_name: state.name,
      count: state.count,
      create_by: state.create_by,
      added_date: state.added_date,
    };
    const res = await history_model.insertHistoryProduct(insert_history);
    if (res.require) {
      Swal.fire({
        title: "เพิ่มสินค้าเรียบร้อย",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => history.push("/product"));
    } else {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: res.message || "ไม่สามารถทำรายการได้",
        icon: "error",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          เพิ่มจำนวนสินค้า
        </h1>
        <p className="text-center text-gray-500 mb-6">
          เลือกและกำหนดจำนวนเบียร์
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              สินค้า *
            </label>
            <Dropdown
              value={state.product_table_uuid || ""}
              onChange={(e) =>
                setState({ ...state, product_table_uuid: e.target.value })
              }
              options={state.product}
              optionLabel="product_name"
              optionValue="product_table_uuid"
              placeholder="เลือกสินค้า"
              style={{ width: "100%", height: "5vh" }}
              filter
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              จำนวน (ขวด) *
            </label>
            <InputText
              keyfilter="int"
              onChange={(e) => setState({ ...state, count: e.target.value })}
              placeholder="เช่น 100"
              className="w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              วันที่ *
            </label>
            <InputText
              type="date"
              onChange={(e) =>
                setState({ ...state, added_date: e.target.value })
              }
              className="w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {state.selectedProductModel && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm border border-blue-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">สินค้า:</span>
                <span className="text-gray-900 font-medium">{state.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">ยี่ห้อ:</span>
                <span className="text-gray-900 font-medium">{state.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">ราคา/ขวด:</span>
                <span className="text-gray-900 font-medium">
                  {state.price} บาท
                </span>
              </div>
              {state.count && state.price && (
                <div className="flex justify-between border-t border-blue-200 pt-2 font-semibold">
                  <span className="text-gray-700">รวม:</span>
                  <span className="text-blue-600 text-lg">
                    {parseInt(state.count || 0) * parseFloat(state.price || 0)}{" "}
                    บาท
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            label={submitting ? "กำลังบันทึก..." : "บันทึก"}
            onClick={() => handleSubmit()}
            className="flex-1 h-10"
            disabled={submitting}
          />
          <Button
            label="ยกเลิก"
            severity="secondary"
            onClick={() => history.push("/product")}
            className="flex-1 h-10"
          />
        </div>
      </div>
    </div>
  );
};
export default Insert;
