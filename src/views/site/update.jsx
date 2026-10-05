import React, { useState, useEffect } from "react";
import { SiteModel, ProjectModel } from "../../models";
import { Button, InputText, Dropdown } from "primereact";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

const site_model = new SiteModel();
const project_model = new ProjectModel();

const Update = (props) => {
  const [state, setState] = useState({
    site_name: "",
    site_table_uuid: "",
    description: "",
    contact: "",
    project_table_uuid: "",
  });
  const history = useHistory();
  useEffect(() => {
    const fetchData = async () => {
      const { uuid } = props.match.params;
      const site = await site_model.getSiteById({ site_table_uuid: uuid });
      const project = await project_model.getProjectBy();
      const {
        site_table_uuid,
        project_table_uuid,
        site_name,
        description,
        contact,
      } = site.data[0];
      setState({
        ...state,
        site_name,
        description,
        contact,
        site_table_uuid,
        project_table_uuid,
        project_data: project.data,
      });
    };
    fetchData();
    return () => {};
  }, []);

  const handleSubmit = async () => {
    const dataUpdate = {
      project_table_uuid: state.project_table_uuid,
      site_table_uuid: state.site_table_uuid,
      site_name: state.site_name,
      description: state.description,
      contact: state.contact,
    };
    const res = await site_model.updateSiteById(dataUpdate);
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

   const handleInput = (e, name) => {
    let updateState = { ...state };
    updateState[name] = e;
    setState(updateState);
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
                  onChange={(e) =>
                    handleInput(e.target.value, "project_table_uuid")
                  }
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
                  value={state.site_name || ""}
                  className="h-10 w-64"
                  placeholder="กรุณาระบุชื่อไซด์"
                  onChange={(e) => handleInput(e.target.value, "site_name")}
                />
              </div>
              <div className="flex flex-col">
                <label>รายละเอียด</label>
                <InputText
                  value={state.description || ""}
                  className="h-10 w-64"
                  placeholder="กรุณาระบุรายละเอียด"
                  onChange={(e) => handleInput(e.target.value, "description")}
                />
              </div>
              <div className="flex flex-col">
                <label>ผู้ติดต่อ</label>
                <InputText
                  value={state.contact || ""}
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

export default Update;
