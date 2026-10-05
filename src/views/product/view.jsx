import React, { useState, useEffect, useRef } from "react";
import { Card, DataTable, InputText, Column, Button, Message } from "primereact";
import { Menu } from "primereact/menu";
import Swal from "sweetalert2";
import { ProductModel, StockModel } from "../../models";
import { useHistory } from "react-router-dom";

const product_model = new ProductModel();
const stock_model = new StockModel();

const ProductView = () => {
  const [state, setState] = useState({
    product: [],
    params: { pagination: { current: 1, pageSize: 10 }, filters: {}, sorters: {} },
    globalFilter: "",
    total: 0,
  });

  const [brandTotals, setBrandTotals] = useState({ Chang: 0, Singha: 0, Leo: 0 });
  const history = useHistory();
  const fetchData = async () => {
    try {
      const res = await stock_model.getStockBy();
      const stockData = res?.data || [];
      const totals = { Chang: 0, Singha: 0, Leo: 0 };
      stockData.forEach((row) => {
        const name = (row.product_name || "").toLowerCase();
        const count = Number(row.stock_count || 0);
        if (name.includes("chang") || name.includes("ช้าง")) totals.Chang += count;
        else if (name.includes("singha") || name.includes("สิงห์")) totals.Singha += count;
        else if (name.includes("leo") || name.includes("ลีโอ")) totals.Leo += count;
      });
      const product = await product_model.getProductBy();
      const data = product?.data || [];
      setState((prev) => ({ ...prev, product: data, total: product?.total || data.length }));
      setBrandTotals(totals);
    } catch (err) {
      console.error("Failed to load stock totals", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const header = () => (
    <div className="flex justify-between">
      <div>
        <InputText
          value={state.globalFilter}
          className="h-8 w-52 rounded-2xl"
          placeholder="ค้นหา..."
          onInput={(e) => setState({ ...state, globalFilter: e.target.value })}
        />
        <i className="absolute pi pi-search -translate-x-8 translate-y-2 text-slate-500 opacity-50"></i>
      </div>

      <div className="flex items-center gap-2">
        <Button className="h-8" label="จำนวน" icon="pi pi-plus" severity="help" onClick={() => history.push(`/product/insert-history`)} />
        <Button className="h-8" label="เพิ่มสินค้า" icon="pi pi-plus" severity="success" onClick={() => history.push(`/product/insert`)} />
      </div>
    </div>
  );

  const _onDelete = (code) => {
    Swal.fire({
      title: `ลบข้อมูล !!`,
      text: `ยืนยันการลบข้อมูล !!`,
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await product_model.deleteProductById({
          product_table_uuid: code,
        });
        if (res.require) {
          await Swal.fire({
            title: `ยืนยันการลบข้อมูล `,
            text: "",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setState((prev) => ({ ...prev, product_table_uuid: "" }));
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

  const RowActions = ({ row }) => {
    const menuRef = useRef(null);
    const items = [
      { label: "แก้ไขข้อมูล", icon: "pi pi-file-edit", command: () => history.push(`/product/update/${row.product_table_uuid || row.id}`) },
      // {
      //   label: "ดูประวัติการขาย",
      //   icon: "pi pi-history",
      //   command: () =>
      //     Swal.fire({
      //       title: `ประวัติการขาย - ${row.product_name || row.name}`,
      //       html: `
      //         <table style="width: 100%; text-align: left;">
      //           <tr><th>วันที่</th><th>จำนวนขาย</th><th>ราคา</th></tr>
      //           ${(row.history || [])
      //           .map((h) => `<tr><td>${h.date}</td><td>${h.quantity_sold}</td><td>${h.price}</td></tr>`)
      //           .join("")}
      //         </table>
      //       `,
      //     }),
      // },
      { label: "ลบข้อมูล", icon: "pi pi-times-circle", command: () => _onDelete(row.product_table_uuid || row.id) },
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
        />
        <Menu model={items} popup ref={menuRef} popupAlignment="right" />
      </div>
    );
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = (date.getFullYear() + 543).toString();
    const time = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return `${day}/${month}/${year} ${time}`;
  };

  const LOW_STOCK_LIMIT = 50;

  const lowStockProducts = state.product.filter(
    (p) => Number(p.count) < LOW_STOCK_LIMIT
  );

  return (
    <div className="text-xl">
      <label>รายการสินค้า</label>
      <div>
        {lowStockProducts.length > 0 && (
          <Message
            severity="warn"
            className="mb-3"
            content={
              <div>
                <b>สินค้าใกล้หมด ({lowStockProducts.length} รายการ)</b>
                <ul className="mt-2 ml-4">
                  {lowStockProducts.map((p) => (
                    <li key={p.product_table_uuid}>
                      🍺 {p.product_name} เหลือ <b className="text-red-500">{p.count}</b> ขวด
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
        )}
      </div>
      <div className="mt-4">
        <Card className="min-h-[60vh] bg-slate-200/25">
          <DataTable
            value={state.product}
            header={header}
            size="small"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            globalFilter={state.globalFilter}
            tableStyle={{ minWidth: "50rem" }}
            responsiveLayout="stack"
          >
            <Column
              header="ลำดับ"
              body={(row, idx) => idx.rowIndex + 1} />
            <Column
              field="product_name"
              header="ชื่อสินค้า" sortable />
            <Column
              field="price"
              header="ราคา" sortable />
            <Column
              field="count"
              header="จำนวนคงเหลือ"
              sortable
              body={(row) => {
                const count = Number(row.count);
                const isLow = count < 50;

                return (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
          ${isLow ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}
        `}
                  >
                    {count} ขวด
                  </span>
                );
              }}
            />

            <Column
              header="เวลาที่เติมสินค้า"
              body={(row) => formatThaiDate(row.create_date)} />
            <Column
              header="การจัดการ"
              body={(row) => (
                <RowActions
                  row={row}
                  onEdit={(data) =>
                    history.push(`/product/update/${data.product_table_uuid}`)
                  }
                  onDelete={(data) => _onDelete(data.product_table_uuid)}
                />
              )}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};

export default ProductView;
