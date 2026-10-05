import React, { useState, useEffect } from "react";
import { ProjectModel, SiteModel } from "../../models";
import { Button, InputText, InputNumber } from "primereact";
import { Calendar } from "primereact/calendar";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import dateFormat from "../../utils/date-format";

const project_model = new ProjectModel();
const site_model = new SiteModel();

let user_data = localStorage.getItem("session-user");
const { firstname, lastname } = JSON.parse(user_data);
const Update = (props) => {
  const [state, setState] = useState({
    project_table_uuid: "",
    project_name: "",
    contract: "",
    start_contract: new Date(),
    end_contract: new Date(),
    budget: "",
    update_by: firstname + " " + lastname,
  });
  const history = useHistory();
  useEffect(() => {
    const fetchData = async () => {
      const { uuid } = props.match.params;

      const project = await project_model.getProjectById({
        project_table_uuid: uuid,
      });
      const site = await site_model.getSiteBy();

      const {
        site_table_uuid,
        project_table_uuid,
        project_name,
        contract,
        start_contract,
        end_contract,
        budget,
        description,
        is_active,
      } = project.data[0];
      setState({
        ...state,
        site: site.data,
        site_table_uuid,
        project_table_uuid,
        project_name,
        contract,
        start_contract,
        end_contract,
        budget,
        is_active,
      });
    };
    fetchData();
    return () => {};
  }, []);
  const handleSubmit = async () => {
    const dataUpdate = {
      project_table_uuid: state.project_table_uuid,
      project_name: state.project_name,
      contract: state.contract,
      start_contract: state.start_contract,
      end_contract: state.end_contract,
      budget: state.budget,
      is_active: state.is_active,
      update_by: state.update_by,
    };
    const res = await project_model.updateProjectById(dataUpdate);
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

  const handleInput = (value, name) => {
    let data = { ...state };
    data[name] = value;
    setState(data);
  };

  // return (
  //   <div className="flex justify-center mt-8">
  //     <div className=" w-full h-auto bg-slate-200 rounded-xl shadow-lg px-5 py-5">
  //       <div className="grid grid-cols">
  //         <div className="flex flex-col ">
  //           <div className="grid grid-cols-3 gap-8">
  //             <div className="flex flex-col">
  //               <label>โครงการ</label>
  //               <InputText
  //                 className="h-10"
  //                 value={state.project_name ?? ""}
  //                 onChange={(e) => handleInput(e.target.value, "project_name")}
  //                 placeholder="กรุณาระบุชื่อสินค้า"
  //               />
  //             </div>
  //             <div className="flex flex-col">
  //               <label>ชื่อคู่สัญญา</label>
  //               <InputText
  //                 className="h-10"
  //                 value={state.contract || ""}
  //                 onChange={(e) => handleInput(e.target.value, "contract")}
  //                 placeholder="กรุณาระบุชื่อคู่สัญญา"
  //               />
  //             </div>
  //             <div className="flex flex-col">
  //               <label>งบประมาณ</label>
  //               <InputNumber
  //                 className="h-10"
  //                 value={state.budget || ""}
  //                 onChange={(e) => handleInput(e.target.value, "budget")}
  //                 placeholder="กรุณาระบุราคาสินค้า"
  //               />
  //             </div>
  //             <div className="flex flex-col">
  //               <label>วันที่จัดซื้อจัดจ้าง</label>
  //               <Calendar
  //                 locale="th"
  //                 value={
  //                   state.start_contract
  //                     ? new Date(state.start_contract)
  //                     : new Date()
  //                 }
  //                 onChange={(e) => {
  //                   const selectedDate = e.value;
  //                   const formattedDate = `${selectedDate.getFullYear()}-${String(
  //                     selectedDate.getMonth() + 1
  //                   ).padStart(2, "0")}-${String(
  //                     selectedDate.getDate()
  //                   ).padStart(2, "0")}`;
  //                   setState({
  //                     ...state,
  //                     start_contract: formattedDate,
  //                   });
  //                 }}
  //                 className="h-10"
  //               />
  //             </div>
  //             <div className="flex flex-col">
  //               <label>วันที่หมดสัญญา</label>
  //               <Calendar
  //                 locale="th"
  //                 value={
  //                   state.end_contract
  //                     ? new Date(state.end_contract)
  //                     : new Date()
  //                 }
  //                 onChange={(e) => {
  //                   const selectedDate = e.value;
  //                   const formattedDate = `${selectedDate.getFullYear()}-${String(
  //                     selectedDate.getMonth() + 1
  //                   ).padStart(2, "0")}-${String(
  //                     selectedDate.getDate()
  //                   ).padStart(2, "0")}`;
  //                   setState({
  //                     ...state,
  //                     end_contract: formattedDate,
  //                   });
  //                 }}
  //                 className="h-10"
  //               />
  //             </div>
  //             <div className="flex flex-col">
  //               <label>รายละเอียด</label>
  //               <InputText
  //                 className="h-10"
  //                 value={state.description || ""}
  //                 onChange={(e) => handleInput(e.target.value, "description")}
  //                 placeholder="รายละเอียด"
  //               />
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //       <div className="flex justify-center mt-14 gap-4">
  //         <Button
  //           label="บันทึก"
  //           className="h-9"
  //           onClick={() => handleSubmit()}
  //         />
  //         <Button
  //           label="ยกเลิก"
  //           severity="info"
  //           onClick={() => history.push("/project")}
  //           outlined
  //           className="h-9"
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default Update;
