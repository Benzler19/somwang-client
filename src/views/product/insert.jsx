import React, { useState } from "react";
import { Button, InputText, Dropdown } from "primereact";
import { ProductModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

const product_model = new ProductModel();
let user_data = localStorage.getItem("session-user");
const { firstname, lastname } = JSON.parse(user_data);

const productOptions = [
  { label: "เลือกสินค้า", value: null },
  {
    label: "เบียร์ช้าง (Chang)",
    value: { name: "เบียร์ช้าง", brand: "Chang", price: "" },
  },
  {
    label: "เบียร์สิงห์ (Singha)",
    value: { name: "เบียร์สิงห์", brand: "Singha", price: "" },
  },
  {
    label: "เบียร์ลีโอ (Leo)",
    value: { name: "เบียร์ลีโอ", brand: "Leo", price: "" },
  },
];

const Insert = () => {
  const [state, setState] = useState({
    selectedProductModel: null,
    name: "",
    count: "",
    product_name: "",
    price: "",
    create_by: firstname + " " + lastname,
    added_date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();

  const handleProductModelSelect = (e) => {
    if (e.value) {
      setState((prev) => ({
        ...prev,
        selectedProductModel: e.value,
        name: e.value.name,
        brand: e.value.brand,
        price: e.value.price ? String(e.value.price) : "",
        count: "",
      }));
    }
  };

  const handleInput = (e, name) => {
    setState({ ...state, [name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (!state.selectedProductModel) {
      Swal.fire({
        title: "กรุณาเลือกสินค้า",
        icon: "warning",
      });
      setSubmitting(false);
      return;
    }

    const isDuplicate = productOptions.some(
      (p) => p.value && p.value.name === state.selectedProductModel.name,
    );

    if (isDuplicate) {
      Swal.fire({
        title: "ไม่สามารถเพิ่มได้",
        text: "สินค้านี้ถูกเพิ่มแล้ว",
        icon: "warning",
      });
      setSubmitting(false);
      return;
    }

    const res = await product_model.insertProduct({
      product_name: state.selectedProductModel.name,
      count: parseInt(state.count || 0),
      create_by: state.create_by,
      price: parseFloat(state.price || 0),
      added_date: state.added_date,
      history: [],
    });

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
          เพิ่มสินค้า
        </h1>
        <p className="text-center text-gray-500 mb-6">
          เลือกและกำหนดจำนวนเบียร์
        </p>

        <div className="space-y-5">
          {/* ProductModel Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              สินค้า *
            </label>
            <Dropdown
              options={productOptions}
              value={state.selectedProductModel ?? null}
              onChange={handleProductModelSelect}
              placeholder="เลือกสินค้า"
              className="w-full"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              จำนวน (ขวด) *
            </label>
            <InputText
              type="number"
              value={state.count}
              onChange={(e) => handleInput(e, "count")}
              placeholder="เช่น 100"
              className="w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ราคา/ขวด (บาท) *
            </label>
            <InputText
              type="number"
              value={state.price}
              onChange={(e) => handleInput(e, "price")}
              placeholder="เช่น 45"
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
              value={state.added_date}
              onChange={(e) => handleInput(e, "added_date")}
              className="w-full h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Summary - only show if selected */}
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
