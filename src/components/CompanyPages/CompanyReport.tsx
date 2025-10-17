/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import companyService from "../../services/CompanyServices";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";

type Product = {
  holderStatus: number;
  product_price: number;
  product_name: string;
  model_no: string;
  company_id: number;
  warrany_tenure: number;
  man_date: string;
  product_image: string;
  product_category: number;
};

type WarrantyRequest = {
  rejection_remark: string;
  reason: string;
  warranty_request_id: number;
  customer_id: number;
  request_date: string;
  customer_name: string;
  customer_email: string;
  phone_number: number;
  model_no: string;
  purchase_date: string;
  holderStatus: number;
  warranty_status: number;
  image: string;
  company_id: number;
};

const CompanyReport = () => {
  const [activeTab, setActiveTab] = useState<"products" | "requests">(
    "products"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<WarrantyRequest[]>([]);
  const companyId = Number(localStorage.getItem("company_id"));

  const [astatus, setAstatus] = useState("");
  const [amodelNo, setAmodelNo] = useState("");
  const [holderStatus, setHolderStatus] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [modelNo, setModelNo] = useState("");

  const [page, setPage] = useState(0);
  const [size, setsize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [requestPage, setRequestPage] = useState(0);
  const [requestSize, setrequestSize] = useState(5);
  const [totalRequestPages, setTotalRequestPages] = useState(1);
  const [remarksmode, setremarksmode] = useState(false);
  const [statuss, setstatuss] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  const loadProducts = async () => {
    try {
      const res = await companyService.fetchProductsreport({
        company_id: companyId,
        page,
        size,
        holderStatus,
        productCategory,
        modelNo,
      });
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      alert("Error loading products: " + err.message);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await companyService.fetchWarrantyRequestsreport({
        company_id: companyId,
        page: requestPage,
        size: requestSize,
        status: astatus,
        modelNo: amodelNo,
      });
      setRequests(res.content || []);
      setTotalRequestPages(res.totalPages || 1);
    } catch (err: any) {
      alert("Error loading warranty requests: " + err.message);
    }
  };

  const handleDownload = () => {
    const data = activeTab === "products" ? products : requests;
    if (!data || data.length === 0) {
      alert("No data to download");
      return;
    }

    const keyLabelMap: Record<string, string> = {
      product_name: "Product Name",
      model_no: "Model No",
      product_price: "Price (₹)",
      warrany_tenure: "Warranty (months)",
      man_date: "Manufacture Date",
      product_category: "Category",
      customer_name: "Customer Name",
      customer_email: "Email",
      phone_number: "Phone",
      request_date: "Request Date",
      warranty_status: "Status",
    };

    const filteredData = data.map((item: any) => {
      const row: any = {};
      Object.keys(item).forEach((key) => {
        if (keyLabelMap[key]) {
          row[keyLabelMap[key]] =
            key === "product_category"
              ? ["", "Electronics", "Plastic", "Wood", "Metal"][item[key]]
              : key === "warranty_status"
              ? ["", "Pending", "Approved", "Rejected"][item[key]]
              : item[key];
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `report_${activeTab}.xlsx`);
  };

  useEffect(() => {
    if (companyId) {
      loadProducts();
    }
  }, [companyId, page]);

  useEffect(() => {
    if (companyId) {
      loadRequests();
    }
  }, [companyId, requestPage]);

  const PageSizeChange = (e: string) => {
    setsize(Number(e));
    setrequestSize(Number(e));
  };

  useEffect(() => {
    loadProducts();
    loadRequests();
  }, [size]);

  const handleStatusChange = async (status: any, requestId: number) => {
    setstatuss(status);
    setRequestId(requestId);
    //setShowConfirmModal(true);
  };

  const confirmAndSave = async () => {
    try {
      await companyService
        .updateWarrantyStatus(requestId, statuss, remarks)
        .then((response) => {
          if (response.data.statusCode === 200) {
            // toast({
            //   type: "success",
            //   title: "Status updated successfully",
            // });
            toast("Status updated successfully");
            setShowConfirmModal(false);
            setstatuss(""); // Clear status after successful update
            setRequestId(0); // Reset requestId
            setRemarks(""); // Clear remarks after successful update
            setremarksmode(false);
          }
        });
      loadRequests();
    } catch (err: any) {
      //  alert("Failed to update status: " + err.message);
      // toast({
      //       type: "success",
      //       title: "Failed to update status: " + err.message,
      //     });
      toast("Failed to update status:  " + err.message);
      setShowConfirmModal(false);
    }
  };
  return (
    <div className="p-6 bg-stone-200 h-full text-black space-y-8">
      <Toaster />
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            <p className="mb-4 text-gray-800">
              Are you sure you want to save the changes?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmAndSave}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handleDownload}
          className="flex items-center bg-teal-600 h-8 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition"
        >
          Download as Excel
        </button>
      </div>

      <div className="flex flex-row justify-between">
        <div className="space-x-2 flex flex-row">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 h-8 flex items-center justify-center rounded-lg font-medium ${
              activeTab === "products"
                ? "bg-teal-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 h-8 flex items-center justify-center rounded-lg font-medium ${
              activeTab === "requests"
                ? "bg-teal-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Warranty Requests
          </button>
        </div>

        {activeTab === "requests" && (
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-md shadow-sm text-sm">
            <input
              type="text"
              onChange={(e) => setAmodelNo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loadRequests();
                }
              }}
              placeholder="Model No"
              className="text-gray-900 placeholder-gray-900 border border-gray-700 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white"
            />

            <select
              value={astatus}
              onChange={(e) => setAstatus(e.target.value)}
              className="text-gray-900 border placeholder-gray-900 border-gray-700 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="1">Pending</option>
              <option value="2">Approved</option>
              <option value="3">Rejected</option>
            </select>

            <button
              onClick={() => {
                setRequestPage(0);
                loadRequests();
              }}
              className="bg-teal-600 text-gray-100 px-4 py-1.5 rounded hover:bg-gray-800 transition"
            >
              {/* Search */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        )}

        {activeTab === "products" && (
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-md shadow-sm text-sm">
            <input
              type="text"
              onChange={(e) => setModelNo(e.target.value)}
              placeholder="Model No"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loadProducts();
                }
              }}
              className="text-gray-900 placeholder-gray-900 border border-gray-700 rounded px-3 py-1 w-48 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white"
            />

            <select
              value={holderStatus}
              onChange={(e) => setHolderStatus(e.target.value)}
              className="text-gray-900 border placeholder-gray-900 border-gray-700 rounded px-3 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white"
            >
              <option value="">All Product Status</option>
              <option value="1">In Company Stocks</option>
              <option value="2">With Retail Seller</option>
              <option value="3">Sold To Customer</option>
              <option value="4">With Customer</option>
              <option value="5">Raised Warranty Request</option>
            </select>

            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="text-gray-900 border placeholder-gray-900 border-gray-700 rounded px-3 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white"
            >
              <option value="">All Categories</option>
              <option value="1">Electronics</option>
              <option value="2">Plastic</option>
              <option value="3">Wood</option>
              <option value="4">Metal</option>
            </select>

            <button
              onClick={() => {
                setPage(0);
                loadProducts();
              }}
              className="bg-teal-600 text-gray-100 px-4 py-1.5 rounded hover:bg-gray-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {/* Search */}
            </button>
          </div>
        )}
      </div>

      {activeTab === "products" && (
        <div className="">
          <div className="border border-gray-300 shadow-sm flex flex-col justify-between h-[215px] overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-left text-gray-800 bg-white">
              <thead className="bg-gray-100 sticky top-0 z-10 text-gray-900">
                <tr>
                  <th className="px-4 py-1 border">Sl No</th>
                  <th className="px-4 py-1 border">Model No</th>
                  <th className="px-4 py-1 border">Product Name</th>
                  <th className="px-4 py-1 border">Price</th>
                  <th className="px-4 py-1 border">Warranty</th>
                  <th className="px-4 py-1 border">Category</th>
                  <th className="px-4 py-1 border">Manufacture Date</th>
                  <th className="px-4 py-1 border">Product Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product:any, index:any) => (
                    <tr key={index} className="hover:bg-gray-50 border-t">
                      <td className="px-4 py-2 border">
                        {page * size + index + 1}
                      </td>
                      <td className="px-4 py-2 border">{product.model_no}</td>
                      <td className="px-4 py-2 border">
                        {product.product_name}
                      </td>
                      <td className="px-4 py-2 border">
                        ₹{product.product_price}
                      </td>
                      <td className="px-4 py-2 border">
                        {product.warrany_tenure} months
                      </td>
                      <td className="px-4 py-2 border">
                        {["", "Electronics", "Plastic", "Wood", "Metal"][
                          product.product_category
                        ] || "Unknown"}
                      </td>
                      <td className="px-4 py-2 border">{product.man_date}</td>
                      <td className="p-2 border">
                        {product.holderStatus === 2
                          ? "With Retail Seller"
                          : product.holderStatus === 3
                          ? "Sold To Customer"
                          : product.holderStatus === 4
                          ? "With Customer"
                          : product.holderStatus === 5
                          ? "Raised Warranty Request"
                          : product.holderStatus === 1
                          ? "In Company Stocks"
                          : "No Data"}
                      </td>{" "}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center gap-2 pb-2 pt-2 bg-white">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-1.5">{`Page ${
              page + 1
            } of ${totalPages}`}</span>
            <button
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={page >= totalPages - 1}
              className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
            <div className="flex items-center gap-2">
              <select
                className="bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500 "
                onChange={(e) => PageSizeChange(e.target.value)}
                value={requestSize.toString()}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="ml-1">per page</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div>
          <div className="border border-gray-300 shadow-sm flex flex-col justify-between min-h-[215px] overflow-x-auto max-h-[300px]">
            <table className="min-w-full table-auto text-sm text-left text-gray-800 max-h-[215px] bg-white">
              <thead className="bg-gray-100 sticky top-0 z-10 text-gray-900">
                <tr>
                  <th className="px-4 py-1 border">Sl.No</th>
                  <th className="px-4 py-1 border">Model No</th>
                  <th className="px-4 py-1 border">Customer Name</th>
                  <th className="px-4 py-1 border">Email</th>
                  <th className="px-4 py-1 border">Phone</th>
                  <th className="px-4 py-1 border">Request Reason</th>
                  <th className="px-4 py-1 border">Respone Message</th>
                  <th className="px-4 py-1 border">Request Date</th>
                  <th className="px-4 py-1 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No warranty requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((req, index) => (
                    <tr
                      key={req.warranty_request_id}
                      className="hover:bg-gray-50 border-t"
                    >
                      <td className="px-4 py-2 border">
                        {requestPage * requestSize + index + 1}
                      </td>
                      <td className="px-4 py-2 border">{req.model_no}</td>
                      <td className="px-4 py-2 border">{req.customer_name}</td>
                      <td className="px-4 py-2 border">{req.customer_email}</td>
                      <td className="px-4 py-2 border">{req.phone_number}</td>
                      <td className="px-4 py-2 border">{req.reason}</td>
                      <td className="px-4 py-2 border">
                        {req.rejection_remark || "Not Responded"}
                      </td>
                      <td className="px-4 py-2 border">{req.request_date}</td>
                      <td
                        className="px-4 py-2 border font-medium text-gray-700 cursor-pointer"
                        title="Change status"
                        onClick={() => setremarksmode(true)}
                      >
                        {
                          ["", "Pending", "Approved", "Rejected"][
                            req.warranty_status
                          ]
                        }
                      </td>
                      {remarksmode && (
                        <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-40">
                          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                            <button
                              onClick={() => setremarksmode(false)}
                              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors bg-white"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>

                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                              Warranty Request Action
                            </h3>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Remarks{" "}
                                  {!remarks.trim() && (
                                    <span className="text-red-500">*</span>
                                  )}
                                </label>
                                <textarea
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  placeholder="Enter your remarks..."
                                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                  autoFocus
                                />
                                {!remarks.trim() && (
                                  <p className="mt-1 text-sm text-red-500">
                                    Remarks are required before changing status
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Status
                                </label>
                                <select
                                disabled={remarks==""}
                                  defaultValue={req.warranty_status}
                                  onChange={(e) => {
                                    if (remarks.trim() === "") {
                                      toast("Please enter remarks first");
                                      return;
                                    }
                                    handleStatusChange(
                                      Number(e.target.value),
                                      req.warranty_request_id
                                    );
                                    //setremarksmode(false);
                                  }}
                                  className={`w-full border px-3 py-2 border-amber-200 bg-amber-50 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none transition  ${
                                    !remarks.trim()
                                      ? "opacity-70 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <option value="1" disabled>
                                    Pending
                                  </option>
                                  <option value="2">Approved</option>
                                  <option value="3">Rejected</option>
                                </select>
                                <div className="flex w-full justify-end text-white">
                                <button onClick={()=>{
                                  setShowConfirmModal(true);
                                }}
                                className="bg-stone-600 mt-2"
                                >
                                  submit
                                </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center gap-2 pb-2 bg-white pt-2">
            <button
              onClick={() => setRequestPage((prev) => Math.max(prev - 1, 0))}
              disabled={requestPage === 0}
              className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-1.5">{`Page ${
              requestPage + 1
            } of ${totalRequestPages}`}</span>
            <button
              onClick={() =>
                setRequestPage((prev) =>
                  Math.min(prev + 1, totalRequestPages - 1)
                )
              }
              disabled={requestPage >= totalRequestPages - 1}
              className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
            <div className="flex items-center gap-2">
              <select
                className="bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500"
                onChange={(e) => PageSizeChange(e.target.value)}
                value={requestSize.toString()}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="ml-1">per page</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyReport;
