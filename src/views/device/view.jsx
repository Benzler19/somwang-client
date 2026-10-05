import React, { useState, useEffect, useRef } from "react";
import { Card, DataTable, InputText, Column, Button } from "primereact";
import { Menu } from "primereact/menu";
import Swal from "sweetalert2";
import { ProductModel } from "../../models";
import { useHistory } from "react-router-dom";

const product_model = new ProductModel();

const ProductView = () => {
  const [state, setState] = useState({
    products: [],
    params: {
      pagination: { current: 1, pageSize: 10 },
      filters: {},
      sorters: {},
    },
    globalFilter: "",
    total: 0,
  });

  const history = useHistory();

  // mock data for demo (product brands: Chang, Singha, Leo)
  const mockProducts = [
    {
      id: 1,
      name: "เบียร์ช้าง",
      brand: "Chang",
      quantity: "",
      price: "",
      history: [
        { date: "2025-01-10", quantity_sold: 20, price: 45 },
        { date: "2025-01-15", quantity_sold: 25, price: 45 },
      ],
    },
    {
      id: 2,
      name: "เบียร์สิงห์",
      brand: "Singha",
      quantity: "",
      price: "",
      history: [
        { date: "2025-01-12", quantity_sold: 30, price: 48 },
        { date: "2025-01-18", quantity_sold: 35, price: 48 },
      ],
    },
    {
      id: 3,
      name: "เบียร์ลีโอ",
      brand: "Leo",
      quantity: "",
      price: "",
      history: [
        { date: "2025-01-11", quantity_sold: 28, price: 40 },
        { date: "2025-01-16", quantity_sold: 22, price: 40 },
      ],
    },
  ];

  useEffect(() => {
    // use mock data for demo
    setState((prev) => ({
      ...prev,
      products: mockProducts,
      total: mockProducts.length,
    }));
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
      <Button
        className="h-8"
        label="เพิ่มสินค้า"
        icon="pi pi-plus"
        onClick={() => history.push(`/product/insert`)}
      />
    </div>
  );

  const _onDelete = (id) => {
    Swal.fire({
      title: `ลบสินค้า !!`,
      text: `ยืนยันการลบสินค้า !!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        setState((prev) => ({
          ...prev,
          products: prev.products.filter((b) => b.id !== id),
        }));
        Swal.fire({
          title: `ลบข้อมูลเรียบร้อย`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const RowActions = ({ row }) => {
    const menuRef = useRef(null);
    const items = [
      {
        label: "แก้ไขข้อมูล",
        icon: "pi pi-file-edit",
        command: () => history.push(`/product/update/${row.id}`),
      },
      {
        label: "ดูประวัติการขาย",
        icon: "pi pi-history",
        command: () =>
          Swal.fire({
            title: `ประวัติการขาย - ${row.name}`,
            html: `
              <table style="width: 100%; text-align: left;">
                <tr><th>วันที่</th><th>จำนวนขาย</th><th>ราคา</th></tr>
                ${(row.history || [])
                  .map(
                    (h) =>
                      `<tr><td>${h.date}</td><td>${h.quantity_sold}</td><td>${h.price}</td></tr>`
                  )
                  .join("")}
              </table>
            `,
          }),
      },
      {
        label: "ลบข้อมูล",
        icon: "pi pi-times-circle",
        command: () => _onDelete(row.id),
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
        />
        <Menu model={items} popup ref={menuRef} popupAlignment="right" />
      </div>
    );
  };

  return (
    <div className="text-xl">
      <label>รายการสินค้า (เบียร์)</label>
      <div>
        <Card className="min-h-[75vh] bg-slate-200/25">
          <DataTable
            value={state.products}
            header={header}
            size="small"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            globalFilter={state.globalFilter}
            tableStyle={{ minWidth: "50rem" }}
            responsiveLayout="stack"
          >
            <Column header="ลำดับ" body={(row, idx) => idx.rowIndex + 1} />
            <Column field="name" header="ชื่อสินค้า" sortable />
            <Column field="brand" header="ยี่ห้อ" sortable />
            <Column field="quantity" header="จำนวนคงเหลือ" sortable />
            <Column field="price" header="ราคา" sortable />
            <Column field="sum" header="รวม" sortable />
            <Column
              header="การจัดการ"
              body={(row) => <RowActions row={row} />}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};

export default ProductView;
