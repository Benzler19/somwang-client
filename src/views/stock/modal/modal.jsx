import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  InputText,
  Toast,
  Button,
  DataTable,
  Column,
  confirmDialog,
} from "primereact";
import GLOBAL from "../../../GLOBAL";
import { StockModel, ProductModel } from "../../../models";

const stock_model = new StockModel();
const product_model = new ProductModel();

let user_data = localStorage.getItem("session-user");
const { firstname, lastname } = JSON.parse(user_data);
const Modal = ({ show, onClose, id, onUpdate }) => {
  const toastRef = useRef(null);

  const [state, setState] = useState({
    loading: "",
    stock: [],
    stock_table_uuid: "",
    globalFilter: "",
    selectedRows: null,
    checkbill_by: `${firstname} ${lastname}`,
  });
  const fetchData = async () => {
    const stock = await stock_model.getStockCheckBillBy();
    const product = await product_model.getProductBy();

    setState({
      ...state,
      stock: stock.data,
      product: product.data
    })
  };

  useEffect(() => {
    fetchData();
  }, [id, show]);

  const handleClose = () => {
    setState({ ...state, stock_table_uuid: "" });
    onClose();
  };

  const header = () => (
    <div className="flex justify-between">
      <label className="text-xl">ชำระเงิน</label>
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
    </div>
  );

  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!state.selectedRows) {
  //     toastRef.current.show({
  //       severity: "warn",
  //       summary: "เลือกโต๊ะก่อน",
  //       detail: "กรุณาเลือกโต๊ะก่อนบันทึก",
  //       life: 3000,
  //     });
  //     return;
  //   }
  //   if (!state.selectedRows) return;

  //   const selectedRow = state.selectedRows;
  //   const uuids = selectedRow.stock_table_uuids.split(",").map((u) => u.trim());
  //   try {
  //     for (const uuid of uuids) {
  //       const dataUpdate = {
  //         stock_table_uuid: uuid,
  //         stock_status: 1,
  //         checkbill_by: state.checkbill_by,
  //       };
  //       await stock_model.updateCheckBillById(dataUpdate);
  //     }
  //     toastRef.current.show({
  //       severity: "success",
  //       summary: "บันทึกข้อมูลสำเร็จ",
  //       detail: "บันทึกข้อมูลสำเร็จ",
  //       life: 3000,
  //     });

  //     if (onUpdate) await onUpdate();
  //     handleClose();
  //   } catch (error) {
  //     console.error("Error:", error);
  //     toastRef.current.show({
  //       severity: "error",
  //       summary: "ข้อผิดพลาด",
  //       detail: "เกิดข้อผิดพลาดบางอย่าง",
  //       life: 3000,
  //     });
  //   }
  // };

  const onSubmit = async (e) => {
  e.preventDefault();

  if (!state.selectedRows) {
    toastRef.current.show({
      severity: "warn",
      summary: "เลือกโต๊ะก่อน",
      detail: "กรุณาเลือกโต๊ะก่อนบันทึก",
      life: 3000,
    });
    return;
  }

  const selectedRow = state.selectedRows;
  const stock_table_uuids = selectedRow.stock_table_uuids
    .split(",")
    .map((u) => u.trim());

  const total_count_detail = JSON.parse(selectedRow.total_count_detail);
  const data_insert = {
    stock_table_uuids,
    checkbill_by: state.checkbill_by,
    total_count_detail,
  };
  try {
    await stock_model.updateCheckBillById(data_insert);

    toastRef.current.show({
      severity: "success",
      summary: "บันทึกข้อมูลสำเร็จ",
      detail: "บันทึกข้อมูลสำเร็จ",
      life: 3000,
    });

    if (onUpdate) await onUpdate();
    handleClose();
  } catch (error) {
    console.error("Error:", error);
    toastRef.current.show({
      severity: "error",
      summary: "ข้อผิดพลาด",
      detail: "เกิดข้อผิดพลาดบางอย่าง",
      life: 3000,
    });
  }
};


  return (
    <>
      <Toast ref={toastRef} />
      <Dialog
        className="z-auto"
        header={state.header}
        visible={show}
        style={{ width: "185vh", height: "80vh" }}
        onHide={handleClose}
        draggable={false}
        footer={() => (
          <>
            <Button
              severity="primary"
              className="m-1"
              label="บันทึก"
              onClick={onSubmit}
            />
            <Button
              severity="secondary"
              className="m-1"
              label="ยกเลิก"
              onClick={handleClose}
            />
          </>
        )}
      >
        <DataTable
          value={state?.stock}
          header={header}
          size="small"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          globalFilter={state.globalFilter}
          tableStyle={{ minWidth: "50rem" }}
          selection={state.selectedRows}
          onSelectionChange={(e) =>
            setState({ ...state, selectedRows: e.value })
          }
          selectionMode="single"
        >
          <Column
            selectionMode="single"
            headerStyle={{ width: "3rem" }}
          ></Column>
          <Column header="ลำดับ" body={(row, idx) => idx.rowIndex + 1} />
          <Column field="stock_table" header="โต๊ะ" sortable></Column>
          <Column
            field="promotion_names"
            header="โปรโมชัน"
            body={(rowData) =>
              rowData.promotion_names ? rowData.promotion_names : "-"
            }
            sortable
          ></Column>
          <Column
            field="detail"
            header="รายการทั้งหมด"
            sortable
          ></Column>
          <Column
            field="total_price"
            header="ราคา"
            sortable
            body={(rowData) =>
              rowData.total_price
                ? `${Number(rowData.total_price).toLocaleString()} บาท`
                : "-"
            }
          />
        </DataTable>
      </Dialog>
    </>
  );
};

export default Modal;
