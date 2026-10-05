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
    historySalesData: [],
  });

  useEffect(() => {
    return () => {};
  }, []);

  const fetchData = async () => {
    const history_sales = await history_model.getHistorySalesBy();
    setState((prev) => ({ ...prev, historySalesData: history_sales.data }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const productOptions = [
    ...new Set((state.historySalesData || []).map((item) => item.product_name)),
  ].map((name) => ({
    label: name,
    value: name,
  }));

  const bill_monthOptions = [
    ...new Set((state.historySalesData || []).map((item) => item.bill_month)),
  ].map((month) => ({
    label: month,
    value: month,
  }));

  const filteredHistory = (state.historySalesData || []).filter((item) => {
    if (!state.productFilter && !state.bill_monthFilter) return true;
    return (
      (!state.productFilter || item.product_name === state.productFilter) &&
      (!state.bill_monthFilter || item.bill_month === state.bill_monthFilter)
    );
  });

  const header = () => (
    <div className="flex justify-between items-center gap-4">
      {/* Left side - Dropdowns */}
      <div className="flex items-center gap-4">
        <Dropdown
          value={state.productFilter}
          options={productOptions}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              productFilter: e.value,
            }))
          }
          placeholder="เลือกสินค้า"
          showClear
          className="h-10 w-52"
        />

        <Dropdown
          value={state.bill_monthFilter}
          options={bill_monthOptions}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              bill_monthFilter: e.value,
            }))
          }
          placeholder="เดือน"
          showClear
          className="h-10 w-52"
        />
      </div>

      {/* Right side - Global search */}
      <div className="relative">
        <InputText
          value={state.globalFilter}
          className="h-10 w-52 rounded-2xl"
          placeholder="Search..."
          onInput={(e) =>
            setState((prev) => ({
              ...prev,
              globalFilter: e.target.value,
            }))
          }
        />
        <i className="absolute pi pi-search right-3 top-3 text-slate-500 opacity-50" />
      </div>
    </div>
  );

  return (
    <div className="text-xl ">
      <div>
        <Card
          title="ประวัติการขายสินค้า"
          className="min-h-[75vh] bg-slate-200/25 "
        >
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
              field="total_count"
              header="จำนวนสินค้า"
              sortable
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="total_amount"
              header="ราคาทั้งหมด"
              sortable
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="bill_month"
              header="เดือน"
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
