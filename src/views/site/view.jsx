import React, { useState, useEffect, useRef } from "react";
import { SiteModel } from "../../models";
import { useHistory } from "react-router-dom";
import { Card, DataTable, InputText, Column, Button } from "primereact";
import { Menu } from "primereact/menu";
import Swal from "sweetalert2";

const site_model = new SiteModel();

const View = () => {
  const [state, setState] = useState({
    loading: "",
    site: "",
    params: {
      pagination: { current: 1, pageSize: 10 },
      filters: {},
      sorters: {},
    },
    globalFilter: "",
    total: 0,
    history: useHistory(),
  });
  const history = useHistory();
  useEffect(() => {
    const fetchData = async (params = state.params) => {
      const site = await site_model.getSiteBy();
      setState({ ...state, site: site.data, total: site.total });
    };
    fetchData();
    return () => {};
  }, [state.site_table_uuid]);

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
        label="เพิ่มไซด์"
        onClick={() => state.history.push(`/site/insert`)}
      />
    </div>
  );

  const filter = () => {
    let filters = {
      site_name: state.globalFilter,
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

  const _onDelete = (code) => {
    Swal.fire({
      title: `ลบข้อมูล !!`,
      text: `ยืนยันการลบข้อมูล !!`,
      icon: "warning",
      showCancelButton: true,
    }).then(async ({ value }) => {
      if (value) {
        const res = await site_model.deleteSiteById({ site_table_uuid: code });
        if (res.require) {
          Swal.fire({
            title: `ยืนยันการลบข้อมูล `,
            text: "",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          }).then((v) => {
            setState({ ...state, site_table_uuid: "" });
          });
        } else {
          Swal.fire({
            title: `ข้อมูลผิดพลาด`,
            text: `โปรดแจ้งผู้ดูแลระบบ กรุณารอสักครู่และลองใหม่อีกครั้ง`,
            icon: "error",
          });
        }
      }
      onabort;
    });
  };

  const onRowSelect = (e) => {
    const rowData = e.data;
    setState((prevState) => ({
      ...prevState,
      site_table_uuid: rowData.site_table_uuid,
    }));
    history.push(`/site/update/${rowData.site_table_uuid}`);
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
    <div>
      <Card className="min-h-[75vh] bg-slate-200/25 ">
        <div className="flex justify-end gap-4 py-2"></div>
        <DataTable
          value={state?.site}
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
          <Column field="project_name" header="โครงการ"></Column>
          <Column
            field="site_name"
            header="ชื่อไซต์"
            sortable
            style={{ width: "25%" }}
          ></Column>
          <Column field="contact" header="ผู้ติดต่อ"></Column>
          <Column field="des_site" header="รายละเอียด"></Column>
          <Column
            header="การจัดการ"
            body={(row) => (
              <RowActions
                row={row}
                onEdit={(data) =>
                  history.push(`/site/update/${data.site_table_uuid}`)
                }
                onDelete={(data) => _onDelete(data.site_table_uuid)}
              />
            )}
          />
        </DataTable>
      </Card>
    </div>
  );
};

export default View;
