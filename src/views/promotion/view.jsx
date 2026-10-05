import React, { useState, useEffect } from "react";
import { PromotionModel } from "../../models";
import { useHistory } from "react-router-dom";
import { Card, DataTable, InputText, Column, Button } from "primereact";
import { Menu } from "primereact/menu";
import Swal from "sweetalert2";

const promotion_model = new PromotionModel();
const View = () => {
  const [state, setState] = useState({
    loading: "",
    promotion: [],
    globalFilter: "",
    total: 0,
  });

  const history = useHistory();
  useEffect(() => {
    return () => {};
  }, []);

  const fetchData = async () => {
    const promotion = await promotion_model.getPromotionBy();
    setState((prev) => ({ ...prev, promotion: promotion.data }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const header = () => (
    <div className="flex justify-between">
      <div>
        <InputText
          value={state.globalFilter}
          className="h-8 w-52 rounded-2xl  "
          placeholder="Search..."
          onInput={(e) =>
            setState({
              ...state,
              globalFilter: e.target.value,
            })
          }
        />
        <i className="absolute pi pi-search -translate-x-8 translate-y-2 text-slate-500 opacity-50 "></i>
      </div>
      <Button
        className="h-8 "
        label="เพิ่มโปรโมชัน"
        onClick={() => history.push(`/promotion/insert`)}
      />
    </div>
  );

  let items = [];
  items.push({
    label: "แก้ไขข้อมูล",
    icon: "pi pi-file-edit",
    command: () => {
      console.log("uuid now:", state.promotion_table_uuid);
      history.push(`/promotion/update/${state.promotion_table_uuid}`);
    },
  });

  items.push({
    label: "ลบข้อมูล",
    icon: "pi pi-times-circle",
    showCancelButton: true,
    command: () => {
      _onDelete(state.promotion_table_uuid);
    },
  });

  const _onDelete = (code) => {
    Swal.fire({
      title: `ลบข้อมูล !!`,
      text: `ยืนยันการลบข้อมูล !!`,
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await promotion_model.deletePromotionById({
          promotion_table_uuid: code,
        });
        if (res.require) {
          await Swal.fire({
            title: `ยืนยันการลบข้อมูล `,
            text: "",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setState((prev) => ({ ...prev, promotion_table_uuid: "" }));
        } else {
          Swal.fire({
            title: `ข้อมูลผิดพลาด`,
            text: `โปรดแจ้งผู้ดูแลระบบ กรุณารอสักครู่และลองใหม่อีกครั้ง`,
            icon: "error",
          });
        }
      }
    });
  };

  const onRowSelect = (e) => {
    const rowData = e.data;
    setState((prevState) => ({
      ...prevState,
      promotion_table_uuid: rowData.promotion_table_uuid,
    }));
    history.push(`/promotion/update/${rowData.promotion_table_uuid}`);
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
      <div>
        <Card title="โปรโมชัน" className="min-h-[75vh] bg-slate-200/25 ">
          <div className="flex justify-end gap-4 py-2"></div>

          <DataTable
            value={state?.promotion}
            header={header}
            size="small"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            globalFilter={state.globalFilter}
            tableStyle={{ minWidth: "50rem" }}
            selectionMode="single"
            onRowSelect={onRowSelect}
          >
            <Column header="ลำดับ" body={(row, idx) => idx.rowIndex + 1} />
            <Column
              field="promotion_name"
              header="ชื่อโปรโมชัน"
              sortable
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="product_name"
              header="ประเภทสินค้า"
              sortable
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="promotion_count"
              header="จำนวนสินค้า"
              sortable
              body={(rowData) => `${rowData.promotion_count} ขวด`}
            />
            <Column
              field="promotion_price"
              header="ราคา"
              sortable
              body={(rowData) => `${rowData.promotion_price} บาท`}
            />
            <Column
              header="การจัดการ"
              body={(row) => (
                <RowActions
                  row={row}
                  onEdit={(data) =>
                    history.push(
                      `/promotion/update/${data.promotion_table_uuid}`
                    )
                  }
                  onDelete={(data) => _onDelete(data.promotion_table_uuid)}
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
