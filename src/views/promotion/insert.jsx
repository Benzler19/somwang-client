import React, { useState, useEffect } from "react";
import { Button, InputText, Dropdown } from "primereact";
import { PromotionModel, ProductModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { Enum } from "../../components/customComponent";
let user_data = localStorage.getItem("session-user");
const { firstname, lastname } = JSON.parse(user_data);
const promotion_model = new PromotionModel();
const product_model = new ProductModel();

const Insert = () => {
  const [state, setState] = useState({
    product_table_uuid: "",
    promotion_name: "",
    promotion_price: "",
    promotion_count: "",
    create_by: firstname + " " + lastname,
  });
  const history = useHistory();
  useEffect(() => {
    const fetchData = async () => {
      const product = await product_model.getProductBy();
      const promotion = await promotion_model.getPromotionBy();
      setState({ ...state, 
        product: product.data, 
        promotion: promotion.data
       });
    };
    fetchData();
  }, []);
  const handleInput = (e, name) => {
    let updateState = { ...state };
    updateState[name] = e;
    setState(updateState);
  };

const handleSubmit = async () => {
  const isDuplicate = state.promotion.some(
    (item) =>
      item.promotion_name.trim().toLowerCase() ===
      state.promotion_name.trim().toLowerCase()
  );

  if (isDuplicate) {
    Swal.fire({
      title: "ชื่อโปรโมชันซ้ำ",
      text: "กรุณาตั้งชื่อโปรโมชันใหม่",
      icon: "warning",
    });
    return;
  }

  const dataInsert = {
    product_table_uuid: state.product_table_uuid,
    promotion_name: state.promotion_name,
    promotion_price: state.promotion_price,
    promotion_count: state.promotion_count,
    create_by: state.create_by,
  };

  const res = await promotion_model.insertPromotion(dataInsert);

  if (res.require) {
    Swal.fire({
      title: "เพิ่มรายการเรียบร้อย",
      icon: "success",
      showConfirmButton: false,
      timer: 2000,
    }).then(() => history.push("/promotion"));
  } else {
    Swal.fire({
      title: "เกิดข้อผิดพลาด !!!",
      text: "ไม่สามารถทำรายการได้กรุณาติดต่อแอดมิน !!!",
      icon: "error",
    });
  }
};

  return (
    <div className="flex justify-center mt-8">
      <div className=" w-auto h-auto bg-slate-200 rounded-xl shadow-lg px-10 py-10">
        <div className="grid grid-cols">
          <div className="flex flex-col">
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label>ชื่อโปรโมชัน</label>
                <InputText
                  className="h-10 w-64"
                  placeholder="กรุณาระบุโปรโมชัน"
                  onChange={(e) =>
                    handleInput(e.target.value, "promotion_name")
                  }
                />
              </div>
              <div className="flex flex-col">
                <label>สินค้า</label>
                <Dropdown
                  value={state.product_table_uuid || ""}
                  onChange={(e) =>
                    handleInput(e.target.value, "product_table_uuid")
                  }
                  options={state.product}
                  optionLabel="product_name"
                  optionValue="product_table_uuid"
                  placeholder="เลือกสินค้า"
                  style={{ width: "100%", height: "5vh" }}
                  filter
                />
              </div>
              <div className="flex flex-col">
                <label>จำนวนสินค้า</label>
                <InputText
                  className="h-10 w-64"
                  placeholder="กรุณาระบุจำนวนสินค้าในโปรโมชัน"
                  onChange={(e) =>
                    handleInput(e.target.value, "promotion_count")
                  }
                />
              </div>
              <div className="flex flex-col">
                <label>ราคาโปรโมชัน</label>
                <InputText
                  className="h-10 w-64"
                  placeholder="กรุณาระบุราคาโปรโมชัน"
                  onChange={(e) =>
                    handleInput(e.target.value, "promotion_price")
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-14 gap-4">
          <Button
            label="บันทึก"
            className="h-9"
            onClick={() => handleSubmit()}
          />
          <Button
            label="ยกเลิก"
            severity="info"
            onClick={() => history.push("/promotion")}
            outlined
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
};
export default Insert;
