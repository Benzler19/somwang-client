import React, { useState, useEffect, useRef } from "react";
import { ProjectModel } from "../../models";
import { useHistory } from "react-router-dom";
import { Card, DataTable, InputText, Column, Button } from "primereact";
import { Menu } from "primereact/menu";
import Swal from "sweetalert2";

const project_model = new ProjectModel();
const View = () => {
  const [state, setState] = useState({
    loading: "",
    project: [],
    params: {
      pagination: { current: 1, pageSize: 10 },
      filters: {},
      sorters: {},
    },
    globalFilter: "",
    total: 0,
  });

  const history = useHistory();
  useEffect(() => {
    const fetchData = async (params = state.params) => {
      const project = await project_model.getProjectBy({ params });
      setState({ ...state, project: project.data, total: project.total });
    };
    fetchData();
    return () => {};
  }, [state.params]);

  const header = () => (
    <div className="flex justify-between">
      <div>
        <InputText
          value={state.globalFilter}
          className="h-8 w-52 rounded-2xl  "
          placeholder="Search..."
          onInput={(e) => setState({ ...state, globalFilter: e.target.value })}
          onKeyPress={(e) => {
            e.code == "Enter" ? filter() : "";
            e.code == "NumpadEnter" ? filter() : "";
          }}
        />
        <i className="absolute pi pi-search -translate-x-8 translate-y-2 text-slate-500 opacity-50 "></i>
      </div>
      <Button
        className="h-8 "
        label="เพิ่มรายการ"
        icon="pi pi-plus"
        onClick={() => history.push(`/project/insert`)}
      />
    </div>
  );

  const filter = () => {
    let filters = {
      device_name: state.globalFilter,
    };
    const newPagination = {
      ...state.params.pagination,
      current: 1,
    };
    setState({
      ...state,
      params: { ...state.params, filters, pagination: newPagination },
    });
  };
  const menuRight = useRef(null);
  let items = [];
  items.push({
    label: "แก้ไขข้อมูล",
    icon: "pi pi-file-edit",
    command: () => {
      history.push(`/project/update/${state.project_table_uuid}`);
    },
  });

  items.push({
    label: "ลบข้อมูล",
    icon: "pi pi-times-circle",
    showCancelButton: true,
    command: () => {
      _onDelete(state.project_table_uuid);
    },
  });

  const _onDelete = (code) => {
    Swal.fire({
      title: `ลบข้อมูล !!`,
      text: `ยืนยันการลบข้อมูล !!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await project_model.deleteProjectById({
          project_table_uuid: code,
        });

        if (res.require) {
          Swal.fire({
            title: `ลบข้อมูลเรียบร้อย`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          setState((prev) => ({
            ...prev,
            project: prev.project.filter((p) => p.project_table_uuid !== code),
          }));
        } else {
          Swal.fire({
            title: `ข้อมูลผิดพลาด`,
            text: `โปรดแจ้งผู้ดูแลระบบ กรุณาลองใหม่อีกครั้ง`,
            icon: "error",
          });
        }
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj)) return "";
    return dateObj.toLocaleDateString("en-GB");
  };

  const onRowSelect = (e) => {
    const rowData = e.data;
    setState((prevState) => ({
      ...prevState,
      project_table_uuid: rowData.project_table_uuid,
    }));
    history.push(`/project/update/${rowData.project_table_uuid}`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("th-TH").format(value);
  };

    const RowActions = ({ row, onEdit, onDelete }) => {
      const menuRef = React.useRef(null);
  
      const items = [
        {
          label: "แก้ไขข้อมูล",
          icon: "pi pi-file-edit",
          command: () => onEdit(row),
        },
        {
          label: "ลบข้อมูล",
          icon: "pi pi-times-circle",
          command: () => onDelete(row),
        },
      ];
  
      return (
        <div className="flex gap-2">
          <Button
            className="text-black h-4 border-none"
            outlined
            icon="pi pi-ellipsis-v"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              menuRef.current?.toggle(e);
            }}
            aria-haspopup
          />
          <Menu model={items} popup ref={menuRef} popupAlignment="right" />
        </div>
      );
    };
  

  return (
    <div className="text-xl ">
      <label>ข้อมูลโครงการ</label>
      <div>
        <Card className="min-h-[75vh] bg-slate-200/25 ">
          <div className="flex justify-end gap-4 py-2"></div>
          <DataTable
            value={state?.project}
            header={header}
            size="small"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            globalFilter={state.globalFilter}
            tableStyle={{ minWidth: "50rem" }}
            responsiveLayout="stack"
            selectionMode="single"
            onRowSelect={onRowSelect}
          >
            <Column header="ลำดับ" body={(row, idx) => idx.rowIndex + 1} />
            <Column
              field="project_name"
              header="ชื่อโครงการ"
              sortable
              style={{ width: "20%" }}
            ></Column>
            <Column
              field="contract"
              header="ชื่อคู่สัญญา"
              sortable
              style={{ width: "20%" }}
            ></Column>
            <Column
              field="start_contract"
              body={(row) => formatDate(row?.start_contract)}
              header="วันที่เริ่มสัญญา"
            ></Column>
            <Column
              field="end_contract"
              body={(row) => formatDate(row?.end_contract)}
              header="วันที่สิ้นสุดสัญญา"
            ></Column>
            <Column
              field="budget"
              body={(row) => formatCurrency(row?.budget)}
              header="งบประมาณ"
              sortable
            ></Column>
            <Column
              header="การจัดการ"
              body={(row) => (
                <RowActions
                  row={row}
                  onEdit={(data) =>
                    history.push(`/project/update/${data.project_table_uuid}`)
                  }
                  onDelete={(data) => _onDelete(data.project_table_uuid)}
                />
              )}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};

export default View;
