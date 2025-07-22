/* eslint-disable @typescript-eslint/no-explicit-any */
// services/SellerService.ts
import axios from "axios";

const BASE_URL = "http://localhost:3089";
const PRODUCT_URL = "http://localhost:1089";
const INVENTORY_API = "http://localhost:3089/allinventory";
const PURCHASE_API = "http://localhost:3089/GetPurchases";
const PRODUCT_DETAILS_API = "http://localhost:1089/products/by-models";

class SellerService {
  async getInventory(params: {
    Seller_Id: number;
    categoryId: number | "";
    modelNo: string;
    warranty: number | "";
    page: number;
    size: number;
  }) {
    const res = await axios.get(INVENTORY_API, { params });
    return res.data;
  }

  async getPurchases(params: {
    Seller_Id: number;
    modelNo: string;
    page: number;
    size: number;
  }) {
    const res = await axios.get(PURCHASE_API, { params });
    return res.data;
  }

  async getProductDetails(modelNos: string[]) {
    const uniqueModelNos = [...new Set(modelNos)].filter(Boolean);
    if (uniqueModelNos.length === 0) return {};
    const res = await axios.post(PRODUCT_DETAILS_API, uniqueModelNos);
    const map: Record<string, any> = {};
    res.data.forEach((prod: any) => {
      map[prod.model_no] = prod;
    });
    return map;
  }

  async fetchInventory(
    sellerId: number,
    categoryId: number | "",
    modelNo: string,
    warranty: number | ""
  ) {
    const res = await axios.get(`${BASE_URL}/allinventory`, {
      params: {
        Seller_Id: sellerId,
        page: 0,
        size: 1000,
        categoryId,
        modelNo,
        warranty: warranty === 0 ? "" : warranty,
      },
    });
    return res.data.content || [];
  }

  async fetchPurchases(sellerId: number, modelNo: string) {
    const res = await axios.get(`${BASE_URL}/GetPurchases`, {
      params: {
        Seller_Id: sellerId,
        modelNo,
        page: 0,
        size: 1000,
      },
    });
    return res.data.content || [];
  }

  async getProductDetailsByModelNos(modelNos: string[]) {
    const unique = [...new Set(modelNos)].filter(Boolean);
    if (unique.length === 0) return {};
    const res = await axios.post(`${PRODUCT_URL}/products/by-models`, unique);
    const map: Record<string, any> = {};
    res.data.forEach((prod: any) => {
      map[prod.model_no] = prod;
    });
    return map;
  }

  async getProductByModelNo(modelNo: string) {
    const res = await axios.get(`${PRODUCT_URL}/getProductDetailsByModelNo`, {
      params: { Model_no: modelNo },
    });
    return res.data;
  }

  async checkEligibility(modelNo: string, checkValue: number) {
    const res = await axios.get(`${PRODUCT_URL}/checkeligibility`, {
      params: { Model_no: modelNo, checkvalue: checkValue },
    });
    return res.data;
  }

  async changeHolderStatus(modelNo: string, status: number) {
    await axios.post(`${PRODUCT_URL}/changeholderstatus`, null, {
      params: { Model_no: modelNo, status },
    });
  }

  async saveInventory(payload: any) {
    await axios.post(`${BASE_URL}/inventory`, payload);
  }

  async editInventory(purchaseId: number, payload: any) {
    await axios.post(`${BASE_URL}/editinventory`, payload, {
      params: { purchaseId },
    });
  }

  async deleteInventory(purchaseId: number) {
    await axios.post(`${BASE_URL}/deleteinventory`, null, {
      params: { purchase_id: purchaseId },
    });
  }

  async savePurchase(payload: any) {
    await axios.post(`${BASE_URL}/purchase`, payload);
  }

  async editPurchase(saleId: number, payload: any) {
    await axios.post(`${BASE_URL}/editpurchase`, payload, {
      params: { sale_id: saleId },
    });
  }

  async deletePurchase(saleId: number) {
    await axios.get(`${BASE_URL}/deletepurchase`, {
      params: { sale_id: saleId },
    });
  }

  async BulkUploadPurchase(file: File, sellerId: number) {
    const formData = new FormData();
    formData.append("file", file); // key must match backend (@RequestParam("file"))

    return axios.post(
      `${BASE_URL}/bulkupload-purchase?seller_id=${sellerId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }
}

export default new SellerService();
