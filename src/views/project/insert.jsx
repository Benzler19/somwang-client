import React, { useState, useEffect } from "react";
import { Button, InputText, Dropdown } from "primereact";
import { Calendar } from "primereact/calendar";
import { ProjectModel, SiteModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import dateFormat from "../../utils/date-format";

let user_data = localStorage.getItem("session-user");
const { firstname, lastname } = JSON.parse(user_data);
const project_model = new ProjectModel();
const site_model = new SiteModel();

const Insert = () => {
  const [state, setState] = useState({
    project_table_uuid: "",
    project_name: "",
    contract: "",
    start_contract: new Date(),
    end_contract: new Date(),
    budget: "",
    description: "",
    is_active: true,      
    site_data: [],   
    create_by: firstname + " " + lastname,
  });
  const history = useHistory();
  useEffect(() => {
    const fetchData = async () => {
      const site_data = await site_model.getSiteBy();
      setState({ ...state, site_data: site_data.data });
    };
    fetchData();
  }, []);

  const handleInput = (value, name) => {
    let data = { ...state };
    data[name] = value;
    setState(data);
  };

  const handleSubmit = async () => {
    const dataInsert = {
      project_table_uuid: state.project_table_uuid,
      project_name: state.project_name,
      contract: state.contract,
      start_contract: state.start_contract,
      end_contract: state.end_contract,
      budget: state.budget,
      description: state.description,
      is_active: state.is_active,
      create_by: state.create_by,
    };

    const res = await project_model.insertProject(dataInsert);
    if (res.require) {
      Swal.fire({
        title: "เพิ่มรายการเรียบร้อย",
        text: "",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      }).then((v) => history.push("/project"));
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
      <div className=" w-full h-auto bg-slate-200 rounded-xl shadow-lg px-5 py-5">
        <div className="grid grid-cols">
          <div className="flex flex-col ">
            <div className="grid grid-cols-3 gap-8">
              <div className="flex flex-col">
                <label>ชื่อสินค้า</label>
                <InputText
                  className="h-10"
                  value={state.project_name || ""}
                  onChange={(e) => handleInput(e.target.value, "project_name")}
                  placeholder="กรุณาระบุชื่อสินค้า"
                />
              </div>
              <div className="flex flex-col">
                <label>ชื่อคู่สัญญา</label>
                <InputText
                  className="h-10"
                  value={state.contract || ""}
                  onChange={(e) => handleInput(e.target.value, "contract")}
                  placeholder="กรุณาระบุชื่อคู่สัญญา"
                />
              </div>
              <div className="flex flex-col">
                <label>ราคาสินค้า</label>
                <InputText
                  className="h-10"
                  value={state.budget || ""}
                  onChange={(e) => handleInput(e.target.value, "budget")}
                  placeholder="กรุณาระบุราคาสินค้า"
                />
              </div>
              <div className="flex flex-col">
                <label>วันที่จัดซื้อ</label>
                <Calendar
                  locale="th"
                  value={
                    state.start_contract
                      ? new Date(state.start_contract)
                      : new Date()
                  }
                  onChange={(e) => {
                    const selectedDate = e.value;
                    const formattedDate = `${selectedDate.getFullYear()}-${String(
                      selectedDate.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                      selectedDate.getDate()
                    ).padStart(2, "0")}`;
                    setState({
                      ...state,
                      start_contract: formattedDate,
                    });
                  }}
                  className="h-10"
                />
              </div>
              <div className="flex flex-col">
                <label>วันที่ขาย</label>
                <Calendar
                  locale="th"
                  value={
                    state.end_contract
                      ? new Date(state.end_contract)
                      : new Date()
                  }
                  onChange={(e) => {
                    const selectedDate = e.value;
                    const formattedDate = `${selectedDate.getFullYear()}-${String(
                      selectedDate.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                      selectedDate.getDate()
                    ).padStart(2, "0")}`;
                    setState({
                      ...state,
                      end_contract: formattedDate,
                    });
                  }}
                  className="h-10"
                />
              </div>
              <div className="flex flex-col">
                <label>รายละเอียด</label>
                <InputText
                  className="h-10"
                  value={state.description || ""}
                  onChange={(e) => handleInput(e.target.value, "description")}
                  placeholder="รายละเอียด"
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
            onClick={() => history.push("/device")}
            outlined
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
};
export default Insert;
