import React, { useState, useEffect } from "react";
import { StockModel } from "../../models";
import { useHistory } from "react-router-dom";
import {
  Card,
  DataTable,
  InputText,
  Column,
  Button,
  Dropdown,
} from "primereact";
import { Menu } from "primereact/menu";
import Swal from "sweetalert2";
import ModalCheckBil from "./modal/modal";
import dateFormat from "../../utils/date-format";

const stock_model = new StockModel();
const View = () => {
  const [state, setState] = useState({
    loading: "",
    stock: [],
    globalFilter: "",
    total: 0,
    show_modal: false,
    selectedDate: null,
    filteredStock: [],
  });

  const history = useHistory();
  useEffect(() => {
    return () => { };
  }, []);
  const fetchData = async () => {
    const stock = await stock_model.getStockBy();
    setState((prev) => ({ ...prev, stock: stock.data }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const dateOptions = [
    ...new Set(state.stock?.map((item) => item.create_date?.slice(0, 10))),
  ].map((date) => ({ label: date, value: date }));

  const handleDateFilter = (date) => {
    setState((prev) => ({
      ...prev,
      selectedDate: date,
      filteredStock: date
        ? prev.stock.filter((item) => item.create_date?.slice(0, 10) === date)
        : prev.stock,
    }));
  };

  const header = () => (
    <div className="flex justify-between">
      <div className="flex">
        <div>
          <InputText
            value={state.globalFilter}
            className="h-10 w-52 rounded-2xl  "
            placeholder="Search..."
            onInput={(e) =>
              setState({
                ...state,
                globalFilter: e.target.value,
              })
            }
          />
          <i className="absolute pi pi-search -translate-x-8 translate-y-3 text-slate-500 opacity-50 "></i>
        </div>
        <div>
          <Dropdown
            value={state.selectedDate}
            options={dateOptions}
            onChange={(e) => handleDateFilter(e.value)}
            placeholder="เลือกวันที่"
            className="ml-4 h-10 w-56 rounded-2xl "
            showClear
          />
        </div>
      </div>
      <div>
        <Button
          className="h-8 mr-2"
          label="ชำระเงิน"
          severity="help"
          onClick={() => openModal()}
        />
        <Button
          className="h-8 "
          label="เพิ่มการขาย"
          onClick={() => history.push(`/stock/insert`)}
        />
      </div>
    </div>
  );

  let items = [];
  items.push({
    label: "แก้ไขข้อมูล",
    icon: "pi pi-file-edit",
    command: () => {
      console.log("uuid now:", state.stock_table_uuid);
      history.push(`/stock/update/${state.stock_table_uuid}`);
    },
  });

  items.push({
    label: "ลบข้อมูล",
    icon: "pi pi-times-circle",
    showCancelButton: true,
    command: () => {
      _onDelete(state.stock_table_uuid);
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
        const res = await stock_model.deleteStockById({
          stock_table_uuid: code,
        });
        if (res.require) {
          await Swal.fire({
            title: `ยืนยันการลบข้อมูล `,
            text: "",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setState((prev) => ({ ...prev, stock_table_uuid: "" }));
          fetchData();
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
      stock_table_uuid: rowData.stock_table_uuid,
    }));
    if (rowData.stock_status === "1") {
      history.push(`/stock/detail/${rowData.stock_table_uuid}`);
    } else {
      history.push(`/stock/update/${rowData.stock_table_uuid}`);
    }
  };

  // const RowActions = ({ row,onDetail, onEdit, onDelete }) => {
  //   const menuRef = React.useRef(null);

  //   const items = [
  //     {
  //       label: "รายละเอียด",
  //       icon: "pi pi-file-edit",
  //       command: () => onDetail(row),
  //     },
  //     {
  //       label: "แก้ไขข้อมูล",
  //       icon: "pi pi-file-edit",
  //       command: () => onEdit(row),
  //     },
  //     {
  //       label: "ลบข้อมูล",
  //       icon: "pi pi-times-circle",
  //       command: () => onDelete(row),
  //     },
  //   ];

  //   return (
  //     <div className="flex gap-2">
  //       <Button
  //         className="text-black h-4 border-none"
  //         outlined
  //         icon="pi pi-ellipsis-v"
  //         onClick={(e) => {
  //           e.preventDefault();
  //           e.stopPropagation();
  //           menuRef.current?.toggle(e);
  //         }}
  //         aria-haspopup
  //       />
  //       <Menu model={items} popup ref={menuRef} popupAlignment="right" />
  //     </div>
  //   );
  // };

  const RowActions = ({ row, onDetail, onEdit, onDelete }) => {
    const menuRef = React.useRef(null);

    let items = [
      {
        label: "รายละเอียด",
        icon: "pi pi-search",
        command: () => onDetail(row),
        visible: true,
      },
      {
        label: "แก้ไขข้อมูล",
        icon: "pi pi-file-edit",
        command: () => onEdit(row),
        visible: true,
      },
      {
        label: "ลบข้อมูล",
        icon: "pi pi-times-circle",
        command: () => onDelete(row),
        visible: true,
      },
    ];

    if (row.stock_status === "1") {
      items = items.map((item) =>
        item.label === "แก้ไขข้อมูล" ? { ...item, visible: false } : item,
      );
    } else if (row.stock_status === "0") {
      items = items.map((item) =>
        item.label === "รายละเอียด" ? { ...item, visible: false } : item,
      );
    }

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

  const openModal = () => {
    setState({
      ...state,
      show_modal: true,
      stock_table_uuid: "",
    });
  };

  return (
    <div className="text-xl font-bold">
      <div>
        <Card title="รายการสั่งซื้อ" className="min-h-[75vh] bg-slate-200/25">
          <div className="flex justify-end gap-4 py-2"></div>
          <DataTable
            value={
              state.filteredStock.length ? state.filteredStock : state.stock
            }
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
            <Column field="stock_table" header="โต๊ะ" sortable></Column>
            <Column
              field="promotion_name"
              header="โปรโมชัน"
              sortable
              body={(rowData) =>
                rowData.promotion_name ? rowData.promotion_name : "-"
              }
            />
            <Column
              field="product_name"
              header="ประเภทสินค้า"
              sortable
            ></Column>
            <Column
              field="stock_count"
              header="จำนวนสินค้า"
              sortable
              body={(rowData) => `${rowData.stock_count} ขวด`}
            />
            <Column
              field="stock_price"
              header="ราคา"
              sortable
              body={(rowData) =>
                rowData.stock_price
                  ? `${Number(rowData.stock_price).toLocaleString()} บาท`
                  : "-"
              }
            />
            <Column
              field="create_date"
              header="เวลาเปิดบิล"
              sortable
              body={(rowData) => {
                if (!rowData.create_date) return "-";

                return new Intl.DateTimeFormat("th-TH", {
                  timeZone: "Asia/Bangkok",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date(rowData.create_date));
              }}
            />
            <Column
              field="checkbill_date"
              header="เวลาเช็คบิล"
              sortable
              body={(rowData) => {
                if (!rowData.checkbill_date) return "-";

                return new Intl.DateTimeFormat("th-TH", {
                  timeZone: "Asia/Bangkok",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date(rowData.checkbill_date));
              }}
            />
            <Column
              field="solution"
              header="ช่องทางการขาย"
              sortable
              body={(rowData) => {
                if (rowData.solution == 1) return "หน้าร้าน";
                if (rowData.solution == 2) return "ออนไลน์";
                return "-";
              }}
            />

            <Column
              field="stock_status"
              header="สถานะ"
              sortable
              body={(rowData) => {
                let text = "-";
                let colorClass = "text-gray-600";

                if (rowData.stock_status === "1") {
                  text = "เช็คบิลแล้ว";
                  colorClass = "text-green-600";
                } else if (rowData.stock_status === "0") {
                  text = "ยังไม่เช็คบิล";
                  colorClass = "text-red-600";
                }

                return <span className={colorClass}>{text}</span>;
              }}
            />
            <Column
              header="การจัดการ"
              body={(row) => (
                <RowActions
                  row={row}
                  onEdit={(data) =>
                    history.push(`/stock/update/${data.stock_table_uuid}`)
                  }
                  onDetail={(data) =>
                    history.push(`/stock/detail/${data.stock_table_uuid}`)
                  }
                  onDelete={(data) => _onDelete(data.stock_table_uuid)}
                />
              )}
            />
          </DataTable>
        </Card>
      </div>
      <ModalCheckBil
        show={state.show_modal}
        id={state.stock_table_uuid}
        onClose={() =>
          setState((prevState) => ({
            ...prevState,
            stock_table_uuid: "",
            show_modal: false,
          }))
        }
        onUpdate={fetchData}
      />
    </div>
  );
};

export default View;
