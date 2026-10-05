import { BaseFetch } from "../main-model";
export default class HistoryModel extends BaseFetch {
  getHistoryBy = (data) =>
    this.authFetch({
      url: "history/getHistoryBy",
      method: "POST",
      body: JSON.stringify(data),
    });
  getHistoryById = (data) =>
    this.authFetch({
      url: "history/getHistoryById",
      method: "POST",
      body: JSON.stringify(data),
    });
  updateHistoryById = (data) =>
    this.authFetch({
      url: "history/updateHistoryById",
      method: "POST",
      body: JSON.stringify(data),
    });
  insertHistory = (data) =>
    this.authFetch({
      url: "history/insertHistory",
      method: "POST",
      body: JSON.stringify(data),
    });
  deleteHistoryById = (data) =>
    this.authFetch({
      url: "history/deleteHistoryById",
      method: "POST",
      body: JSON.stringify(data),
    });
  getHistoryBySite = (data) =>
    this.authFetch({
      url: "history/getHistoryBySite",
      method: "POST",
      body: JSON.stringify(data),
    });
  getHistoryOutOfStock = (data) =>
    this.authFetch({
      url: "history/getHistoryOutOfStock",
      method: "POST",
      body: JSON.stringify(data),
    });
  insertHistoryProduct = (data) =>
    this.authFetch({
      url: "history/insertHistoryProduct",
      method: "POST",
      body: JSON.stringify(data),
    });
  getHistorySalesBy = (data) =>
    this.authFetch({
      url: "history/getHistorySalesBy",
      method: "POST",
      body: JSON.stringify(data),
    });
}
