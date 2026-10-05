import React, { useState, useEffect } from "react";
import { Button, InputText, Dropdown } from "primereact";
import { SiteModel, ProjectModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
let user_data = localStorage.getItem("session-user");
const { firstname, lastname } = JSON.parse(user_data);

const site_modal = new SiteModel();
const project_model = new ProjectModel();

const Insert = () => {
  const [state, setState] = useState({
    site_name: "",
    project_table_uuid: "",
    description: "",
    contact: "",
    create_by: firstname + " " + lastname,
    params: {
      pagination: { current: 1, pageSize: 10 },
      filters: {},
      sorters: {},
    },
  });
  const history = useHistory();
  useEffect(() => {
    const fetchData = async () => {
      const project = await project_model.getProjectBy();
      setState({ ...state, project_data: project.data });
    };
    fetchData();
  }, []);
  const handleInput = (e, name) => {
    let updateState = { ...state };
    updateState[name] = e;
    setState(updateState);
  };

  const handleSubmit = async () => {
    const dataInsert = {
      project_table_uuid: state.project_table_uuid,
      site_name: state.site_name,
      description: state.description,
      contact: state.contact,
      is_active: state.is_active,
      create_by: state.create_by,
    };
    const res = await site_modal.insertSite(dataInsert);
    if (res.require) {
      Swal.fire({
        title: "เพิ่มรายการเรียบร้อย",
        text: "",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      }).then((v) => history.push("/site"));
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
      <div className=" w-auto h-auto bg-slate-100 rounded-xl shadow-lg px-5 py-5">
        <div className="grid grid-cols">
          <div className="flex flex-col ">
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label>ชื่อไซต์</label>
                <Dropdown
                  value={state.project_table_uuid || ""}
                  onChange={(e) => handleInput(e.target.value, "project_table_uuid")}
                  options={state.project_data}
                  optionLabel="project_name"
                  optionValue="project_table_uuid"
                  placeholder="เลือกโครงการ"
                  style={{ width: "100%", height: "5vh" }}
                  filter
                />
              </div>
              <div className="flex flex-col">
                <label>ชื่อไซต์</label>
                <InputText
                  className="h-10 w-64"
                  placeholder="กรุณาระบุชื่อไซด์"
                  onChange={(e) => handleInput(e.target.value, "site_name")}
                />
              </div>
              <div className="flex flex-col">
                <label>รายละเอียด</label>
                <InputText
                  className="h-10 w-64"
                  placeholder="กรุณาระบุรายละเอียด"
                  onChange={(e) => handleInput(e.target.value, "description")}
                />
              </div>
              <div className="flex flex-col">
                <label>ผู้ติดต่อ</label>
                <InputText
                  className="h-10 w-64"
                  placeholder="กรุณาระบุผู้ติดต่อ"
                  onChange={(e) => handleInput(e.target.value, "contact")}
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
            onClick={() => history.push("/site")}
            outlined
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
};
export default Insert;
