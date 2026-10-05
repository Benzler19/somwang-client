import React, { useState, useEffect } from "react";
import { PromotionModel, StockModel, ProductModel } from "../../models";
import { Button, InputText, Dropdown, Card, InputNumber } from "primereact";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
let user_data = localStorage.getItem("session-user");
const { firstname, lastname } = JSON.parse(user_data);
const promotion_model = new PromotionModel();
const stock_model = new StockModel();
const product_model = new ProductModel();

const Update = (props) => {
  const [state, setState] = useState({
    stock_table_uuid: "",
    product_table_uuid: "",
    promotion_table_uuid: "",
    stock_count: "",
    description: "",
    stock_table: "",
    solution: "",
    update_by: firstname + " " + lastname,
  });
  const history = useHistory();
  useEffect(() => {
    const fetchData = async () => {
      const { uuid } = props.match.params;

      const stock = await stock_model.getStockById({
        stock_table_uuid: uuid,
      });
      const promotion = await promotion_model.getPromotionBy();
      const product = await product_model.getProductBy();

      const {
        stock_table_uuid,
        product_table_uuid,
        promotion_table_uuid,
        stock_count,
        stock_price,
        description,
        promotion_status,
        stock_table,
        holiday_status,
        solution,
      } = stock.data[0];
      setState({
        ...state,
        product: product.data,
        promotion: promotion.data,
        stock_table_uuid,
        product_table_uuid,
        promotion_table_uuid,
        stock_count,
        stock_price,
        description,
        promotion_status,
        stock_table,
        holiday_status,
        solution,
      });
    };
    fetchData();
    return () => {};
  }, []);

  const handleInput = (e, name) => {
    let updateState = { ...state };
    updateState[name] = e;
    setState(updateState);
  };

  const handleSubmit = async () => {
    const product = state.product.find(
      (p) => p.product_table_uuid === state.product_table_uuid,
    );

    if (!product) {
      Swal.fire({
        icon: "error",
        title: "ไม่พบข้อมูลสินค้า",
      });
      return;
    }

    const productCount = Number(product.count || 0);
    const inputStockCount = Number(state.stock_count || 0);

    if (inputStockCount > productCount) {
      Swal.fire({
        icon: "warning",
        title: "จำนวนไม่พอ",
        text: `สินค้าในคลังมี ${productCount} ชิ้น แต่เพิ่มในรายการ ${inputStockCount} ชิ้น`,
      });
      return;
    }

    const dataUpdate = {
      stock_table_uuid: state.stock_table_uuid,
      product_table_uuid: state.product_table_uuid,
      promotion_table_uuid: state.promotion_table_uuid,
      description: state.description,
      stock_price: state.stock_price,
      stock_count: state.stock_count,
      promotion_status: state.promotion_status,
      stock_table: state.stock_table,
      update_by: state.update_by,
      solution: state.solution,
    };
    const res = await stock_model.updateStockById(dataUpdate);
    if (res.require) {
      Swal.fire({
        title: "แก้ไขรายการเรียบร้อย",
        text: "",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      }).then((v) => history.push("/stock"));
    } else {
      Swal.fire({
        title: "เกิดข้อผิดพลาด !!!",
        text: "ไม่สามารถทำรายการได้กรุณาติดต่อแอดมิน !!!",
        icon: "error",
      });
    }
  };

  const handlePromotionChange = (promotion_table_uuid) => {
    const selected = state.promotion.find(
      (item) => item.promotion_table_uuid === promotion_table_uuid,
    );
    setState((prev) => ({
      ...prev,
      promotion_table_uuid,
      stock_count: selected?.promotion_count || "",
      stock_price: selected?.promotion_price || "",
      product_table_uuid: selected?.product_table_uuid || "",
    }));
  };

  const handlePromotionStatus = (value) => {
    const val = Number(value);
    setState((prev) => ({
      ...prev,
      promotion_status: val,
    }));
    resetFieldsByStatus(val);
  };

    const handleSolutionStatus = (value) => {
    const val = Number(value);
    setState((prev) => ({
      ...prev,
      solution_status: val,
    }));
    resetFieldsByStatus(val);
  };

  const calculatePrice = (newState) => {
    const product = state.product.find(
      (item) => item.product_table_uuid === newState.product_table_uuid,
    );

    if (!product) return;

    const count = Number(newState.stock_count || 0);
    const pricePerUnit = Number(product.price || 0);

    const total = count * pricePerUnit;

    setState((prev) => ({
      ...prev,
      stock_price: total,
    }));
  };

  const resetFieldsByStatus = (status) => {
    if (status === 1) {
      setState((prev) => ({
        ...prev,
        product_table_uuid: "",
        stock_count: "",
        stock_price: "",
        description: "",
        solution: "",
      }));
    } else if (status === 2) {
      setState((prev) => ({
        ...prev,
        promotion_table_uuid: "",
        stock_count: "",
        stock_price: "",
        description: "",
        solution: "",
      }));
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <Card
        title="การขาย"
        className=" w-auto h-auto bg-slate-50 rounded-xl shadow-lg px-10 py-10"
      >
        <div className="grid grid-cols font-bold">
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col mb-4">
                <label className="">โต๊ะ</label>
                <InputText
                  value={state.stock_table || ""}
                  className="h-10 w-full"
                  placeholder="กรุณาระบุโต๊ะลูกค้า"
                  onChange={(e) => handleInput(e.target.value, "stock_table")}
                  disabled
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="mb-2">เลือก</label>
                <div className="flex gap-4">
                  <div>
                    <input
                      type="radio"
                      name="radio-12"
                      value={1}
                      checked={Number(state.promotion_status) === 1}
                      className="radio bg-blue-100 border-blue-300 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600"
                      onChange={(e) => handlePromotionStatus(e.target.value)}
                      disabled
                    />
                    <label className="ml-2 mr-4">มีโปรโมชัน</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      name="radio-12"
                      value={2}
                      checked={Number(state.promotion_status) === 2}
                      className="radio bg-red-100 border-red-300 checked:bg-red-200 checked:text-red-600 checked:border-red-600"
                      onChange={(e) => handlePromotionStatus(e.target.value)}
                      disabled
                    />
                    <label className="ml-2">ไม่มีมีโปรโมชัน</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label>เลือกโปรโมชัน</label>
                <Dropdown
                  value={state.promotion_table_uuid || ""}
                  onChange={(e) => handlePromotionChange(e.value)}
                  options={state.promotion}
                  optionLabel={(item) =>
                    `${item.product_name} - ${item.promotion_name}`
                  }
                  optionValue="promotion_table_uuid"
                  placeholder="เลือกโปรโมชัน (ถ้ามี)"
                  className="h-10 w-72"
                  filter
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label>เลือกสินค้า</label>
                <Dropdown
                  value={state.product_table_uuid || ""}
                  onChange={(e) => {
                    const product_table_uuid = e.target.value;

                    setState((prev) => ({
                      ...prev,
                      product_table_uuid,
                    }));

                    calculatePrice({
                      ...state,
                      product_table_uuid,
                      stock_count: state.stock_count,
                    });
                  }}
                  options={state.product}
                  optionLabel="product_name"
                  optionValue="product_table_uuid"
                  placeholder="เลือกสินค้า"
                  className="h-10 w-72"
                  filter
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label>จำนวน</label>
                <InputText
                  className="h-10 w-32"
                  keyfilter="int"
                  placeholder="จำนวน"
                  value={state.stock_count || ""}
                  onChange={(e) => {
                    const stock_count = e.target.value;

                    setState((prev) => ({
                      ...prev,
                      stock_count,
                    }));

                    calculatePrice({
                      ...state,
                      stock_count,
                      product_table_uuid: state.product_table_uuid,
                    });
                  }}
                  disabled
                />
              </div>
              <div className="flex flex-col col-span-1">
                <label>ราคา (บาท)</label>
                <InputNumber
                  className="h-10 w-full"
                  placeholder="ราคา"
                  value={state.stock_price || ""}
                  onChange={(e) => handleInput(e.target.value, "stock_price")}
                  disabled
                />
              </div>
              <div className="flex flex-col col-span-2">
                <label>รายละเอียด</label>
                <InputText
                  value={state.description || ""}
                  className="h-10 w-full"
                  placeholder="รายละเอียด"
                  onChange={(e) => handleInput(e.target.value, "description")}
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col mb-4">
            <label className="mb-2">เลือก</label>
            <div className="flex gap-4">
              <div>
                <input
                  type="radio"
                  name="radio-12"
                  value={1}
                  defaultChecked
                  className="radio bg-blue-100 border-blue-300 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600"
                  onChange={(e) => handlePromotionStatus(e.target.value)}
                />
                <label className="ml-2 mr-4">หน้าร้าน</label>
              </div>
              <div>
                <input
                  type="radio"
                  name="radio-12"
                  value={2}
                  className="radio bg-red-100 border-red-300 checked:bg-red-200 checked:text-red-600 checked:border-red-600"
                  onChange={(e) => handlePromotionStatus(e.target.value)}
                />
                <label className="ml-2">ออนไลน์</label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-14 gap-4">
          <Button
            label="กลับ"
            severity="info"
            onClick={() => history.push("/stock")}
            outlined
            className="h-9"
          />
        </div>
      </Card>
    </div>
  );
};

export default Update;
