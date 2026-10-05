import { BaseFetch } from "../main-model";
export default class ProductModel extends BaseFetch {
  getProductBy = (data) =>
    this.authFetch({
      url: "product/getProductBy",
      method: "POST",
      body: JSON.stringify(data),
    });
  getProductById = (data) =>
    this.authFetch({
      url: "product/getProductById",
      method: "POST",
      body: JSON.stringify(data),
    });
  updateProductById = (data) =>
    this.authFetch({
      url: "product/updateProductById",
      method: "POST",
      body: JSON.stringify(data),
    });
  insertProduct = (data) =>
    this.authFetch({
      url: "product/insertProduct",
      method: "POST",
      body: JSON.stringify(data),
    });
  deleteProductById = (data) =>
    this.authFetch({
      url: "product/deleteProductById",
      method: "POST",
      body: JSON.stringify(data),
    });
  getProductBySite = (data) =>
    this.authFetch({
      url: "product/getProductBySite",
      method: "POST",
      body: JSON.stringify(data),
    });
  getProductOutOfStock = (data) =>
    this.authFetch({
      url: "product/getProductOutOfStock",
      method: "POST",
      body: JSON.stringify(data),
    });
}
