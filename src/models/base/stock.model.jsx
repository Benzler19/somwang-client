import { BaseFetch } from "../main-model";
export default class StockModel extends BaseFetch {
  getStockBy = (data) =>
    this.authFetch({
      url: "stock/getStockBy",
      method: "POST",
      body: JSON.stringify(data),
    });
    getStockStatusCheckBillBy = (data) =>
    this.authFetch({
      url: "stock/getStockStatusCheckBillBy",
      method: "POST",
      body: JSON.stringify(data),
    });
  getStockCheckBillBy = (data) =>
    this.authFetch({
      url: "stock/getStockCheckBillBy",
      method: "POST",
      body: JSON.stringify(data),
    });
  getStockById = (data) =>
    this.authFetch({
      url: "stock/getStockById",
      method: "POST",
      body: JSON.stringify(data),
    });
  updateStockById = (data) =>
    this.authFetch({
      url: "stock/updateStockById",
      method: "POST",
      body: JSON.stringify(data),
    });
  updateCheckBillById = (data) =>
    this.authFetch({
      url: "stock/updateCheckBillById",
      method: "POST",
      body: JSON.stringify(data),
    });
  insertStock = (data) =>
    this.authFetch({
      url: "stock/insertStock",
      method: "POST",
      body: JSON.stringify(data),
    });
  deleteStockById = (data) =>
    this.authFetch({
      url: "stock/deleteStockById",
      method: "POST",
      body: JSON.stringify(data),
    });
}
