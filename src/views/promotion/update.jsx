import React, { useState, useEffect } from "react";
import { PromotionModel, ProductModel } from "../../models";
import { Button, InputText, Dropdown } from "primereact";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { Enum } from "../../components/customComponent";
let user_data = localStorage.getItem("session-user");
const { firstname, lastname } = JSON.parse(user_data);
const promotion_model = new PromotionModel();
const product_model = new ProductModel();

const Update = (props) => {
  const [state, setState] = useState({
    product_table_uuid: "",
    promotion_name: "",
    promotion_price: "",
    promotion_count: "",
    update_by: firstname + " " + lastname,
  });
  const history = useHistory();
  useEffect(() => {
    const fetchData = async () => {
      const { uuid } = props.match.params;

      const promotion = await promotion_model.getPromotionById({
        promotion_table_uuid: uuid,
      });
      const promotionData = await promotion_model.getPromotionBy(); 
      const product = await product_model.getProductBy();

      const {
        product_table_uuid,
        promotion_name,
        promotion_price,
        promotion_count,
      } = promotion.data[0];
      setState({
        ...state,
        product: product.data,
        product_table_uuid,
        promotion_name,
        promotion_price,
        promotion_count,
        promotionData: promotionData.data
      });
    };
    fetchData();
    return () => {};
  }, []);
  const handleSubmit = async () => {
      const isDuplicate = state.promotionData.some(
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
    const dataUpdate = {
      promotion_name: state.promotion_name,
      promotion_price: state.promotion_price,
      promotion_count: state.promotion_count,
      product_table_uuid: state.product_table_uuid,
      update_by: state.update_by,
    };
    const res = await product_model.updateProductById(dataUpdate);
    if (res.require) {
      Swal.fire({
        title: "เพิ่มรายการเรียบร้อย",
        text: "",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      }).then((v) => history.push("/promotion"));
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
      <div className="w-auto h-auto bg-slate-100 rounded-xl shadow-lg px-5 py-5">
        <div className="grid grid-cols">
           <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label>ชื่อโปรโมชัน</label>
              <InputText
                className="h-10 w-64"
                value={state.promotion_name || ""}
                placeholder="กรุณาระบุชื่อกล้อง"
                onChange={(e) =>
                  setState({ ...state, promotion_name: e.target.value })
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
                value={state.promotion_count || ""}
                placeholder="กรุณาระบุละติจูด"
                onChange={(e) =>
                  setState({ ...state, promotion_count: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label>ราคาโปรโมชัน</label>
              <InputText
                className="h-10 w-64"
                value={state.promotion_price || ""}
                placeholder="กรุณาระบุลองจิจูด"
                onChange={(e) =>
                  setState({ ...state, promotion_price: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-14 gap-4">
          <Button
            label="บันทึก"
            className="h-8"
            onClick={() => handleSubmit()}
          />
          <Button
            label="ยกเลิก"
            severity="info"
            onClick={() => history.push("/promotion")}
            outlined
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
};

export default Update;
