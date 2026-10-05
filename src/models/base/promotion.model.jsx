import { BaseFetch } from "../main-model"
export default class PromotionModel extends BaseFetch {
    getPromotionBy = (data) =>
    this.authFetch({
      url: "promotion/getPromotionBy",
      method: "POST",
      body: JSON.stringify(data),
    })
    getPromotionById = (data) =>
    this.authFetch({
      url: "promotion/getPromotionById",
      method: "POST",
      body: JSON.stringify(data),
    })
    updatePromotionById = (data) =>
    this.authFetch({
      url: "promotion/updatePromotionById",
      method: "POST",
      body: JSON.stringify(data),
    })
    insertPromotion = (data) =>
    this.authFetch({
      url: "promotion/insertPromotion",
      method: "POST",
      body: JSON.stringify(data),
    })
    deletePromotionById = (data) =>
    this.authFetch({
      url: "promotion/deletePromotionById",
      method: "POST",
      body: JSON.stringify(data),
    })
}
