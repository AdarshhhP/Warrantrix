/* eslint-disable @typescript-eslint/no-explicit-any */
// services/CustomerService.ts
import axios from "axios";

class CustomerService {
  baseUrl = "http://localhost:4089";
  productUrl = "http://localhost:1089";

  async getRegisteredWarranties(customerId: number, modelNo = "") {
    const res = await axios.get(`${this.baseUrl}/warranty-requests-customer`, {
      params: { customerId, modelNo },
    });
    return res.data || [];
  }

    async getRegisteredWarrantiesCompany(customerId: number, modelNo = "") {
    const res = await axios.get(`${this.baseUrl}/warranty-requests-company`, {
      params: { customerId, modelNo },
    });
    return res.data || [];
  }

  async getWarrantyRequests(customerId: number, modelNo = "") {
    const res = await axios.get(
      `${this.baseUrl}/raised-warranty-requests-customer`,
      {
        params: { userId: customerId, modelNo },
      }
    );
    return res.data || [];
  }
  

  async getProductDetailsByModels(modelNos: string[]) {
    const res = await axios.post(`${this.productUrl}/products/by-models`, modelNos);
    return res.data || [];
  }

   async changeApprovalStatus(payload: any) {
    return axios.post(`${this.baseUrl}/change_approval_status`, payload);
  }

  async deleteRegisteredWarranty(purchaseId: number) {
    return axios.post(`${this.baseUrl}/delete-registered-warranty`, null, {
      params: { purchase_Id: purchaseId },
    });
  }

  async editRegisteredWarranty(purchaseId: number, payload: any) {
    return axios.post(`${this.baseUrl}/editregistered-warranty`, payload, {
      params: { purchase_Id: purchaseId },
    });
  }

  async registerWarranty(payload: any) {
    return axios.post(`${this.baseUrl}/register-warranty`, payload);
  }

  async checkEligibility(modelNo: string, checkValue: number) {
    const res = await axios.get(
      `${this.productUrl}/checkeligibility?Model_no=${modelNo}&checkvalue=${checkValue}`
    );
    return res.data;
  }

  async updateHolderStatus(modelNo: string, status: number) {
    return axios.post(
      `${this.productUrl}/changeholderstatus?Model_no=${modelNo}&status=${status}`
    );
  }

  async raiseWarrantyRequest(payload: any) {
    return axios.post(`${this.baseUrl}/raise-warranty-request`, payload);
  }
}
const customerService=new CustomerService();

export default customerService;
