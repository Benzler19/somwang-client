import React, { useState, useEffect } from "react";
import { ProductModel } from "../../models";
import { Button, InputText, Dropdown } from "primereact";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
let user_data = localStorage.getItem("session-user");
const { firstname, lastname, role_id } = JSON.parse(user_data);

const product_model = new ProductModel();

const Update = (props) => {
  const [state, setState] = useState({
    id: "",
    selectedProduct: "",
    name: "",
    brand: "",
    quantity: "",
    price: "",
    history: [],
    newHistoryDate: "",
    newHistoryQty: "",
    newHistoryPrice: "",
    update_by: firstname + " " + lastname,
    role_id: "",
  });
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      const { uuid } = props.match.params;
      try {
        const res = await product_model.getProductById({
          product_table_uuid: uuid,
        });
        const data = res?.data && res.data.length ? res.data[0] : null;
        if (data) {
          setState((prev) => ({
            ...prev,
            id: data.product_table_uuid || uuid,
            selectedProduct: null,
            name: data.product_name || data.name || "",
            brand: data.brand || "",
            quantity:
              data.count !== undefined
                ? String(data.count)
                : data.quantity || "",
            price:
              data.price !== undefined ? String(data.price) : data.price || "",
            history: data.history || [],
          }));
        } else {
          setState((prev) => ({ ...prev, id: uuid }));
        }
      } catch (err) {
        console.error("Failed to fetch product by id", err);
        setState((prev) => ({ ...prev, id: uuid }));
      }
    };
    fetchData();
  }, []);

  const handleInput = (e, name) => {
    setState({ ...state, [name]: e.target.value });
  };

  const handleProductSelect = (e) => {
    if (e.value) {
      setState({
        ...state,
        selectedProduct: e.value,
        name: e.value.name,
        brand: e.value.brand,
        price: e.value.price.toString(),
      });
    } else {
      setState({
        ...state,
        selectedProduct: null,
        name: "",
        brand: "",
        price: "",
      });
    }
  };

  const addHistoryEntry = () => {
    if (
      !state.newHistoryDate ||
      !state.newHistoryQty ||
      !state.newHistoryPrice
    ) {
      Swal.fire({ title: "กรุณากรอกข้อมูลประวัติให้ครบถ้วน", icon: "warning" });
      return;
    }
    setState({
      ...state,
      history: [
        ...state.history,
        {
          date: state.newHistoryDate,
          quantity_sold: parseInt(state.newHistoryQty),
          price: parseFloat(state.newHistoryPrice),
        },
      ],
      newHistoryDate: "",
      newHistoryQty: "",
      newHistoryPrice: "",
    });
  };

  const removeHistoryEntry = (idx) => {
    setState({
      ...state,
      history: state.history.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async () => {
    if (!state.name || !state.quantity || !state.price) {
      Swal.fire({ title: "กรุณากรอกข้อมูลให้ครบถ้วน", icon: "warning" });
      return;
    }

    const finalRoleId =
      role_id === 1 // ถ้าเป็น super admin
        ? state.role_id // ใช้ค่าที่เลือก
        : 7;

    const payload = {
      product_table_uuid: state.id,
      product_name: state.name,
      brand: state.brand,
      count: parseInt(state.quantity),
      price: parseFloat(state.price),
      history: state.history,
      role_id: finalRoleId,
      update_by: state.update_by,
    };
    const res = await product_model.updateProductById(payload);
    if (res.require) {
      Swal.fire({
        title: "อัปเดตรายการเรียบร้อย",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => history.push("/product"));
    } else {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: res.message || "ไม่สามารถทำรายการได้",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="w-full max-w-2xl bg-slate-200 rounded-xl shadow-lg px-5 py-5">
        <h2 className="text-2xl font-semibold mb-4">แก้ไขสินค้า</h2>

        {/* <div className="mb-6 bg-white rounded-lg p-4">
          <label className="font-semibold block mb-2">เลือกสินค้า</label>
          <Dropdown
            options={productOptions}
            value={state.selectedProduct}
            onChange={handleProductSelect}
            placeholder="เลือกสินค้า"
            className="w-full"
          />
        </div> */}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="font-semibold">ชื่อสินค้า</label>
            <InputText
              className="h-10"
              value={state.name || ""}
              placeholder="เช่น เบียร์ช้าง"
              onChange={(e) => handleInput(e, "name")}
              disabled
            />
          </div>
          {/* <div className="flex flex-col">
            <label className="font-semibold">ยี่ห้อ</label>
            <InputText
              className="h-10"
              value={state.brand || ""}
              placeholder="เช่น Chang"
              onChange={(e) => handleInput(e, "brand")}
            />
          </div> */}
          <div className="flex flex-col">
            <label className="font-semibold">จำนวน (ขวด)</label>
            <InputText
              className="h-10"
              type="number"
              value={state.quantity || ""}
              placeholder="150"
              onChange={(e) => handleInput(e, "quantity")}
            />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold">ราคา (บาท)</label>
            <InputText
              className="h-10"
              type="number"
              value={state.price || ""}
              placeholder="45"
              onChange={(e) => handleInput(e, "price")}
            />
          </div>
        </div>

        {/* <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">เพิ่มรายการสต๊อก</h3>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label className="text-sm">วันที่</label>
              <InputText
                className="h-8 w-full"
                type="date"
                value={state.newHistoryDate}
                onChange={(e) => handleInput(e, "newHistoryDate")}
              />
            </div>
            <div>
              <label className="text-sm">จำนวนขาย</label>
              <InputText
                className="h-8 w-full"
                type="number"
                value={state.newHistoryQty}
                placeholder="20"
                onChange={(e) => handleInput(e, "newHistoryQty")}
              />
            </div>
            <div>
              <label className="text-sm">ราคา</label>
              <InputText
                className="h-8 w-full"
                type="number"
                value={state.newHistoryPrice}
                placeholder="45"
                onChange={(e) => handleInput(e, "newHistoryPrice")}
              />
            </div>
          </div>
          <Button
            label="เพิ่มรายการสต๊อก"
            className="h-8 text-sm"
            onClick={addHistoryEntry}
          />
        </div> */}

        {state.history.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">
              การขาย ({state.history.length})
            </h3>
            <div className="grid gap-2">
              {state.history.map((h, idx) => (
                <div
                  key={idx}
                  className="text-sm p-2 bg-gray-100 rounded flex justify-between items-center"
                >
                  <span>
                    {h.date} - ขาย {h.quantity_sold} ขวด @ {h.price} บาท
                  </span>
                  <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger text-xs"
                    onClick={() => removeHistoryEntry(idx)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <Button
            label="บันทึก"
            className="h-10"
            onClick={() => handleSubmit()}
          />
          <Button
            label="ยกเลิก"
            severity="info"
            onClick={() => history.push("/product")}
            outlined
            className="h-10"
          />
        </div>
      </div>
    </div>
  );
};

export default Update;
