/* eslint-disable @typescript-eslint/no-explicit-any */
// services/CompanyService.ts
import axios from "axios";

class CompanyService {
  baseProductUrl = "http://localhost:1089";
  baseRequestUrl = "http://localhost:4089";
   API_BASE_PRODUCT = "http://localhost:1089";
 API_BASE_REQUEST = "http://localhost:4089";

  async fetchProducts(params: {
    company_id: number;
    holderStatus?: string;
    productCategory?: string;
    ModelNo?: string;
    page?: number;
    size?: number;
  }) {
    const res = await axios.get(`${this.baseProductUrl}/getProducts`, {
      params,
    });
    return res.data.content || [];
  }
  async fetchSerialData(productId: number, is_sold: number, page: number, size: number) {
  const response= axios.get(`${this.baseProductUrl}/not-sold`, {
    params: {
      is_sold,
      page,
      size,
      productId
    }
  });
  return response;
}


  // async fetchSerialData(product_id:number){
  //  return axios.get(`${this.baseProductUrl}/getProductDetailsByProductId?productId=${product_id}`)
  // }
 async changeSerialNoStatuses(payload: any) {
    return axios.post(`${this.baseProductUrl}/changeserialStatus`, payload);
  }

   async PostQuantity(prodId: number, quantity: number) {
    return axios.post(`${this.baseProductUrl}/addQuantity?productId=${prodId}&quantity=${quantity}`);
  }

  async postProduct(payload: any) {
    return axios.post(`${this.baseProductUrl}/postproduct`, payload);
  }

   async postBatch(payload: any) {
    return axios.post(`${this.baseProductUrl}/api/batch/create`, payload);
  }
  
  async getDataBySerial(payload: any) {
    return axios.post(`${this.baseProductUrl}/getDataBySerial`, payload);
  }

 async fetchSerialByBatch(BatchNo:string){
   return axios.get(`${this.baseProductUrl}/api/batch/getSerialByModelNo?BatchNo=${BatchNo}`)
  }


  async BulkUploadProduct( file: File,companyId:number) {
  const formData = new FormData();
  formData.append("file", file); // key must match backend (@RequestParam("file"))

  return axios.post(`${this.baseProductUrl}/bulkupload-products`, formData, {
    params: { company_id: companyId },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}


  async fetchWarrantyRequests(params: {
    company_id: number;
    status?: string;
    modelNo?: string;
    page?: number;
    size?: number;
  }) {
    const res = await axios.get(`${this.baseRequestUrl}/getraised-warranty-requests`, {
      params,
    });
    return res.data.content || [];
  }

  async updateWarrantyStatus(purchase_id: number, status: string, rejection_remarks: string) {
    return axios.get(`${this.baseRequestUrl}/warranty-action`, {
      params: { purchase_id, status ,rejection_remarks},
    });
  }

   async fetchProductsreport({
    company_id,
    page,
    size,
    holderStatus,
    productCategory,
    modelNo,
  }: {
    company_id: number;
    page: number;
    size: number;
    holderStatus?: string;
    productCategory?: string;
    modelNo?: string;
  }) {
    const res = await axios.get(`${this.API_BASE_PRODUCT}/getProducts`, {
      params: {
        company_id,
        page,
        size,
        holderStatus,
        productCategory,
        ModelNo: modelNo,
      },
    });
    return res.data;
  }

  async fetchWarrantyRequestsreport({
    company_id,
    page,
    size,
    status,
    modelNo,
  }: {
    company_id: number;
    page: number;
    size: number;
    status?: string;
    modelNo?: string;
  }) {
    const res = await axios.get(`${this.API_BASE_REQUEST}/getraised-warranty-requests`, {
      params: {
        company_id,
        status,
        modelNo,
        page,
        size,
      },
    });
    return res.data;
  }
  async deleteSerialFromBatch(batchNo: string, serialNumber: string) {
  return axios.post(`${this.baseProductUrl}/api/batch/remove-serial`, {
    batchNo,
    serialNumber,
  });
}

}

const companyService= new CompanyService();
export default companyService;