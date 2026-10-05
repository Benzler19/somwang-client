import React, { useState, useEffect } from "react";
import { HistoryModel } from "../../models";
import { useHistory } from "react-router-dom";
import { Card, DataTable, InputText, Column, Dropdown } from "primereact";
import { Menu } from "primereact/menu";
import Swal from "sweetalert2";

const history_model = new HistoryModel();
const View = () => {
  const [state, setState] = useState({
    loading: "",
    history: [],
    globalFilter: "",
    total: 0,
    productFilter: null,
  });

  useEffect(() => {
    return () => { };
  }, []);

  const fetchData = async () => {
    const history = await history_model.getHistoryBy();
    setState((prev) => ({ ...prev, history: history.data }));
  };

  useEffect(() => {
    fetchData();
  }, []);

const header = () => (
  <div className="flex justify-between items-center gap-4">
    {/* Dropdown filter */}
    <Dropdown
      value={state.productFilter}
      options={productOptions}
      onChange={(e) =>
        setState(prev => ({
          ...prev,
          productFilter: e.value
        }))
      }
      placeholder="เลือกสินค้า"
      showClear
      className="h-10 w-52"
    />

    {/* Global search */}
    <div className="relative">
      <InputText
        value={state.globalFilter}
        className="h-10 w-52 rounded-2xl"
        placeholder="Search..."
        onInput={(e) =>
          setState(prev => ({
            ...prev,
            globalFilter: e.target.value
          }))
        }
      />
      <i className="absolute pi pi-search right-3 top-3 text-slate-500 opacity-50" />
    </div>
  </div>
);

  const productOptions = [
    ...new Set(state.history.map(item => item.product_name))
  ].map(name => ({
    label: name,
    value: name
  }));

const filteredHistory = state.history.filter(item => {
  if (!state.productFilter) return true;
  return item.product_name === state.productFilter;
});


  return (
    <div className="text-xl ">
      <div>
        <Card title="ประวัติการเพิ่มสินค้า" className="min-h-[75vh] bg-slate-200/25 ">
          <div className="flex justify-end gap-4 py-2"></div>

          <DataTable
            value={filteredHistory}
            header={header}
            size="small"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            globalFilter={state.globalFilter}
            tableStyle={{ minWidth: "50rem" }}
            selectionMode="single"
          >
            <Column header="ลำดับ" body={(row, idx) => idx.rowIndex + 1} />
            <Column
              field="product_name"
              header="ชื่อสินค้า"
              sortable
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="count"
              header="จำนวนสินค้า"
              sortable
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="added_date"
              header="วันที่"
              sortable
              tyle={{ width: "25%" }}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};

export default View;
