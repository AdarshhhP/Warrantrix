/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import companyService from "../../services/CompanyServices";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import TemplateGenerator, {
  type Columns,
} from "../BulkUpload/TemplateGenerator";

const categories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Plastic" },
  { id: 3, name: "Wood" },
  { id: 4, name: "Metal" },
];

type Product = {
  productImages: string[];
  holderStatus: number;
  product_price: number;
  product_name: string;
  model_no: string;
  image: FileList;
  company_id: number;
  warrany_tenure: number;
  man_date: string;
  product_images: string[];
  product_category: number;
};

type WarrantyRequest = {
  reason: string;
  warranty_request_id: number;
  customer_id: number;
  request_date: string;
  customer_name: string;
  customer_email: string;
  phone_number: number;
  model_no: string;
  purchase_date: string;
  warranty_status: number;
  productImages: string[];
  company_id: number;
  rejection_remark: string;
};

export interface BulkUploadResponse {
  message: string; // e.g. ".xlsx"
  statusCode: number; // e.g. 509
  successRecords: string[]; // list of successful entries (e.g., product names)
  failedRecords: string[]; // list of failed rows or error messages
}

const Company = () => {
  const [activeTab, setActiveTab] = useState<"products" | "requests">(
    "products"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<WarrantyRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [remarks, setRemarks] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageModelNo, setpreviewImageModelNo] = useState("");
  const [previewImageREquest, setpreviewImageREquest] = useState<string | null>(
    null
  );
  const [holderStatus, setHolderStatus] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [ModelNo, setModelNo] = useState("");
  const [astatus, setAstatus] = useState("");
  const [amodelNo, setAmodelNo] = useState("");
  const [bulkuploadmode, setbulkuploadmode] = useState(true);
  const [remarksmode, setremarksmode] = useState(false);
  const { register, handleSubmit, reset } = useForm<Product>();
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const [bulkUploadResults, setBulkUploadResults] = useState<{
    failedRecords: string[];
    successRecords: string[];
    message?: string;
    statusCode?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const companyId = Number(localStorage.getItem("company_id"));

  useEffect(() => {
    if (companyId) {
      fetchProducts();
      fetchRequests();
    }
  }, [companyId]);

  const fetchProducts = async () => {
    try {
      const data = await companyService.fetchProducts({
        company_id: companyId,
        holderStatus,
        productCategory,
        ModelNo,
        page: 0,
        size: 1000,
      });
      const productsWithImages = data.map((product: any) => ({
        ...product,
        productImages: product.productImages || [],
      }));

      setProducts(productsWithImages);
    } catch (err: any) {
      // alert("Failed to fetch products: " + err.message);
      toast("Failed to fetch products: " + err.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await companyService.fetchWarrantyRequests({
        company_id: companyId,
        status: astatus,
        modelNo: amodelNo,
        page: 0,
        size: 1000,
      });
      setRequests(data);
    } catch (err: any) {
      // alert("Failed to fetch warranty requests: " + err.message);
      toast("Failed to fetch warranty requests: : " + err.message);
    }
  };
  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data: Product) => {
    try {
      const base64Images = await Promise.all(
        images.map((file) => convertToBase64(file))
      );
      const payload = {
        product_category: data.product_category,
        man_date: data.man_date,
        product_name: data.product_name,
        productImages: base64Images,
        product_price: Number(data.product_price),
        warrany_tenure: Number(data.warrany_tenure),
        model_no: data.model_no,
        company_id: companyId,
      };
      await companyService.postProduct(payload);
      toast("Added Product successfully");
      reset();
      setShowForm(false);
      setImages([]);
      fetchProducts();
    } catch (error: any) {
      // alert("Error adding product: " + error.message);
      toast("Error Adding Product" + error.message);
    }
  };

  const handleStatusChange = async (status: any, requestId: number) => {
    try {
      await companyService
        .updateWarrantyStatus(requestId, status, remarks)
        .then((response) => {
          if (response.data.statusCode === 200) {
            // toast({
            //   type: "success",
            //   title: "Status updated successfully",
            // });
            toast("Status updated successfully");

            setRemarks(""); // Clear remarks after successful update
            setremarksmode(false);
          }
        });
      fetchRequests();
    } catch (err: any) {
      //  alert("Failed to update status: " + err.message);
      // toast({
      //       type: "success",
      //       title: "Failed to update status: " + err.message,
      //     });
      toast("Failed to update status:  " + err.message);
    }
  };

  const handleReset = () => {
    setModelNo("");
    setHolderStatus("");
    setProductCategory("");
    setAstatus("");
    setAmodelNo("");
    setResetDone(true); // trigger useEffect
  };

  // This useEffect will run AFTER all states have been reset
  useEffect(() => {
    if (resetDone) {
      fetchProducts();
      fetchRequests();
      setResetDone(false); // reset the flag
    }
  }, [resetDone]);

  const handleBulkUpload = () => {
    if (!bulkFile) {
      // toast({
      //   title: "Please select a file before uploading.",
      //   type: "destructive",
      // });

      toast("Please select a file before uploading");
      return;
    }

    companyService
      .BulkUploadProduct(bulkFile as File, companyId)
      .then((response: { data: BulkUploadResponse }) => {
        const { statusCode, message } = response.data;
        setBulkUploadResults(response.data); // Store the results

        if (statusCode === 200) {
          toast(message || "Upload successful");
          fetchProducts();
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // ✅
            setBulkFile(null); // Clear the file state
          }
        } else if (statusCode === 509) {
          toast(message || "File format issue");
        } else {
          toast(message || "Couldn't upload file");
        }
      })
      .catch((error: unknown) => {
        console.error("Bulk upload failed:", error);
        toast("Failed to upload file");
      });
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
  };

  const baseColumnsConfig: Columns = [
    {
      Name: "Model_no",
      columnWidth: 20,
      isRequired: true,
      isList: false,
      comment: "Enter the product model number",
    },
    {
      Name: "Product_name",
      columnWidth: 30,
      isRequired: true,
      isList: false,
      comment: "Enter the name of the product",
    },
    {
      Name: "Product_category",
      columnWidth: 25,
      isRequired: true,
      isList: true,
      comment: "Select a product category",
      options: ["Metal", "Plastic", "Wood", "Electronics"],
      showErrorMessage: true,
      error: "Choose a valid product category",
      errorTitle: "Invalid Category",
    },
    {
      Name: "Product_price",
      columnWidth: 15,
      isRequired: true,
      isList: false,
      comment: "Enter the product price",
    },
    {
      Name: "Man_date",
      columnWidth: 20,
      isRequired: true,
      isList: false,
      comment: "Enter the manufacturing date (YYYY-MM-DD)",
    },
    {
      Name: "Warrany_tenure",
      columnWidth: 15,
      isRequired: true,
      isList: false,
      comment: "Enter warranty period in months",
    },
    {
      Name: "Image_URL",
      columnWidth: 40,
      isRequired: false,
      isList: false,
      comment: "Enter base64 string for product image (optional)",
    },
  ];
  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 p-6 md:p-8">
      <Toaster />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <p className="text-sm md:text-xl font-bold text-gray-800">Products</p>

        {activeTab === "products" && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-stone-500 h-8 justify-center hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col md:flex-col justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex space-x-2 justify-start w-full">
          <button
            onClick={() => setActiveTab("products")}
            className={`h-8 items-center justify-center flex rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "products"
                ? "bg-stone-500 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`h-8 items-center justify-center flex rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "requests"
                ? "bg-stone-500 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Requests
          </button>
          {activeTab === "products" && (
            <div className="flex items-center justify-end gap-3 p-1 rounded-lg shadow-xs border border-none w-full">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={ModelNo}
                  onChange={(e) => setModelNo(e.target.value)}
                  placeholder="Model No"
                  className="text-gray-900 px-2 placeholder-gray-400 border border-gray-200 rounded-lg h-8 items-center justify-center w-full md:w-48 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                />
                <select
                  value={holderStatus}
                  onChange={(e) => setHolderStatus(e.target.value)}
                  className="text-gray-600 border px-2 border-gray-200 rounded-lg h-8 items-center justify-center w-full md:w-40 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                >
                  <option value="">All Status</option>
                  <option value="1">In Company Stocks</option>
                  <option value="2">With Retail Seller</option>
                  <option value="3">Sold To Customer</option>
                  <option value="4">With Customer</option>
                  <option value="5">Raised Warranty Request</option>
                </select>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="text-gray-600 border px-2 border-gray-200 rounded-lg h-8 items-center justify-center w-full md:w-40 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                >
                  <option value="">All Categories</option>
                  <option value="1">Electronics</option>
                  <option value="2">Plastic</option>
                  <option value="3">Wood</option>
                  <option value="4">Metal</option>
                </select>
              </div>
              <div className="flex flex-row gap-1">
                <button
                  onClick={fetchProducts}
                  className="bg-stone-500 text-white h-8 items-center justify-center rounded-lg hover:bg-gray-700 transition-colors duration-200 flex gap-2"
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
                <button
                  onClick={handleReset}
                  className="bg-stone-500 text-white h-8 justify-centerrounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {/* Reset */}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Filters */}
        {activeTab === "requests" && (
          <div className="flex justify-between w-full gap-3 p-3 bg-white rounded-lg shadow-xs border border-gray-100">
            <div className="flex flex-row gap-3">
              <input
                type="text"
                value={amodelNo}
                onChange={(e) => setAmodelNo(e.target.value)}
                placeholder="Model No"
                className="text-gray-900 px-2 placeholder-gray-400 border border-gray-200 rounded-lg h-8 items-center justify-center focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
              />
              <select
                value={astatus}
                onChange={(e) => setAstatus(e.target.value)}
                className="text-gray-900 px-2 border border-gray-200 rounded-lg h-8 items-center justify-center focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
              >
                <option value="">All Status</option>
                <option value="1">Pending</option>
                <option value="2">Approved</option>
                <option value="3">Rejected</option>
              </select>
            </div>
            <button
              onClick={fetchRequests}
              className="bg-stone-500 text-white py-1.5 rounded-lg hover:bg-gray-700 transition-colors duration-200 w-fit flex items-center justify-center gap-2"
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl relative max-w-xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 bg-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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

            {/* Main Image */}
            <div className="max-h-[60vh] overflow-auto mb-4">
              <img
                src={previewImage}
                alt="Product Preview"
                className="object-contain rounded-lg mx-auto max-w-full"
              />
            </div>

            {/* Thumbnail Gallery */}
            {(() => {
              const foundProduct = products.find((p) =>
                p.model_no?.includes(previewImageModelNo)
              );
              console.log(foundProduct, "foundProduct");

              return foundProduct &&
                foundProduct.productImages &&
                foundProduct.productImages.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {foundProduct.productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewImage(img)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                        img === previewImage
                          ? "border-gray-600"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {previewImageREquest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl relative max-w-4xl w-full">
            <button
              onClick={() => setpreviewImageREquest(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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

            {/* Main Image */}
            <div className="max-h-[60vh] overflow-auto mb-4">
              <img
                src={previewImageREquest}
                alt="Product Preview"
                className="object-contain rounded-lg mx-auto max-w-full"
              />
            </div>

            {/* Thumbnail Gallery */}
            {(() => {
              const foundProduct = requests.find((p) =>
                p.productImages?.includes(previewImageREquest)
              );
              return foundProduct &&
                foundProduct.productImages &&
                foundProduct.productImages.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {foundProduct.productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setpreviewImageREquest(img)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                        img === previewImage
                          ? "border-gray-600"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {activeTab === "products" && (
        <div className="grid gap-6 grid-cols-4">
          {products.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500 mt-4 text-lg">No products found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 hover:bg-stone-500 bg-stone-600 text-white font-medium flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add your first product
              </button>
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-xl p-2 space-y-2  border-gray-300 hover:shadow-md transition-shadow duration-200"
              >
                {/* Header */}
                <div className="flex flex-col items-center justify-between">
                  <p className="text-sm pb-1 font-semibold text-gray-700 truncate">
                    {product.product_name}
                    {/* <span className="font-semibold text-gray-600 pb-1">
                      {product.product_name}
                    </span> */}
                  </p>
                  {product.productImages && (
                    <div className="">
                      <img
                        className="h-28 w-auto object-contain rounded-md"
                        src={product.productImages[0]}
                      />
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="space-y-1">
                  {/* Model */}
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    📦 Model: {product.model_no}
                  </p>

                  {/* Price */}
                  <p className="text-xs text-gray-700 font-medium flex items-center gap-1">
                    💰 ₹{product.product_price}
                  </p>

                  {/* Warranty */}
                  <p className="text-xs flex items-center gap-1 text-gray-600">
                    🛡 Warranty: {product.warrany_tenure} months
                  </p>

                  {/* Category */}
                  <p className="text-xs flex items-center gap-1 text-gray-600">
                    🏷 Category:{" "}
                    {["", "Electronics", "Plastic", "Wood", "Metal"][
                      product.product_category
                    ] || "Unknown"}
                  </p>

                  {/* Holder Status */}
                  <p className="text-xs flex items-center gap-1 whitespace-nowrap">
                    📘 <span className="text-gray-600">Status:</span>{" "}
                    <span
                      className={`font-medium whitespace-nowrap ${
                        product.holderStatus === 1
                          ? "text-blue-600"
                          : product.holderStatus === 2
                          ? "text-purple-600"
                          : product.holderStatus === 3
                          ? "text-green-600"
                          : product.holderStatus === 4
                          ? "text-cyan-600"
                          : product.holderStatus === 5
                          ? "text-amber-600"
                          : "text-gray-500"
                      }`}
                    >
                      {product.holderStatus === 1
                        ? "In Company Stocks"
                        : product.holderStatus === 2
                        ? "With Retail Seller"
                        : product.holderStatus === 3
                        ? "Sold to Customer"
                        : product.holderStatus === 4
                        ? "With Customer"
                        : product.holderStatus === 5
                        ? "Warranty Requested"
                        : "No Data"}
                    </span>
                  </p>

                  {/* Manufacture Date */}
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    🗓 Mfg Date: {product.man_date}
                  </p>

                  {/* View Image Button */}
                  {product.productImages && (
                    <button
                      onClick={() => {
                        setPreviewImage(product.productImages[0]);
                        setpreviewImageModelNo(product.model_no);
                      }}
                      className="text-xs text-gray-600 hover:underline mt-1 bg-white"
                    >
                      🔍 View Images
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Requests Grid */}
      {activeTab === "requests" && (
        <div className="grid gap-6 grid-cols-4">
          {requests.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500 mt-4 text-lg">
                No warranty requests found
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.warranty_request_id}
                className="bg-white shadow-sm rounded-lg p-3 space-y-2 border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <h2 className="text-base font-medium text-gray-800">
                  {req.customer_name}
                </h2>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                    Model: {req.model_no}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {req.customer_email}
                  </p>

                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {req.phone_number}
                  </p>

                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Request Date: {req.request_date}
                  </p>

                  <p className="text-sm flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span
                      className={`text-xs font-medium cursor-pointer ${
                        req.warranty_status === 1
                          ? "text-amber-500"
                          : req.warranty_status === 2
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                      onClick={() => setremarksmode(true)}
                    >
                      {req.warranty_status === 1
                        ? "Pending"
                        : req.warranty_status === 2
                        ? "Approved"
                        : "Rejected"}
                    </span>
                  </p>

                  {req.productImages && (
                    <button
                      onClick={() =>
                        setpreviewImageREquest(req.productImages[0])
                      }
                      className="text-blue-600 text-xs font-medium hover:underline bg-white"
                    >
                      View Image
                    </button>
                  )}

                  <p className="text-xs text-gray-500 flex items-start gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-400 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex flex-col">
                      <p>Reason: {req.reason}</p>
                      <p>Remarks: {req.rejection_remark}</p>
                    </div>
                  </p>
                </div>

                {remarksmode && (
                  <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50">
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
                            value={req.warranty_status}
                            onChange={(e) => {
                              if (remarks.trim() === "") {
                                toast("Please enter remarks first");
                                return;
                              }
                              handleStatusChange(
                                Number(e.target.value),
                                req.warranty_request_id
                              );
                              setremarksmode(false);
                            }}
                            className={`w-full border px-3 py-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 outline-none transition ${
                              req.warranty_status === 1
                                ? "border-amber-200 bg-amber-50"
                                : req.warranty_status === 2
                                ? "border-green-200 bg-green-50"
                                : "border-red-200 bg-red-50"
                            } ${
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
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-gray-600">
                  Add New Product
                </h3>
                <div className="flex flex-row gap-2">
                  {!bulkuploadmode && (
                    <TemplateGenerator
                      columnsConfig={baseColumnsConfig}
                      TemplateName={"ProductUploadTemplate"}
                    />
                  )}
                  <button
                    className="bg-stone-500 text-white h-9 flex items-center justify-center"
                    onClick={() => setbulkuploadmode(!bulkuploadmode)}
                    title="Back"
                  >
                    {bulkuploadmode ? "Bulk Upload" : "<-"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="bg-white text-gray-400 hover:text-gray-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                    title="Close Form"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="black"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              {bulkuploadmode ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        {...register("product_name")}
                        required
                        className="w-full border h-8 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                        placeholder="Product Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model No
                      </label>
                      <input
                        {...register("model_no")}
                        required
                        className="w-full border border-gray-300 h-8 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                        placeholder="Model Number"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-gray-700">
                        Upload Image
                      </label>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="w-full border px-4 h-8 py-1 rounded-lg"
                        />
                        {/* <span onClick={() => setImages([])}>Clear</span> */}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Category
                      </label>
                      <select
                        {...register("product_category")}
                        required
                        className="w-full border border-gray-300 py-1 rounded-lg px-4 h-8 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">
                          ₹
                        </span>
                        <input
                          {...register("product_price")}
                          type="number"
                          min="0"
                          required
                          className="w-full border h-8 border-gray-300 rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warranty Tenure (Months)
                      </label>
                      <input
                        {...register("warrany_tenure")}
                        type="number"
                        min="0"
                        required
                        className="w-full border h-8 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                        placeholder="12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturing Date
                      </label>
                      <input
                        {...register("man_date")}
                        type="date"
                        required
                        max={new Date().toISOString().split("T")[0]} // sets today's date as max
                        className="w-full border h-8 bg-gray-300 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-gray-600 h-8 text-white px-6 py-3 rounded-lg w-full hover:bg-gray-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Save Product
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row gap-3">
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleBulkFileChange}
                      className="w-full border px-4 py-2 rounded-lg"
                      ref={fileInputRef}
                    />
                    <button
                      onClick={handleBulkUpload}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
                      title="Upload"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                    </button>

                    <button
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
                      onClick={() => {
                        setBulkUploadResults(null);
                        setBulkFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      title="Reset"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582M20 20v-5h-.581M3.977 9A9.003 9.003 0 0112 3a9 9 0 018 4.472M20.023 15A9.003 9.003 0 0112 21a9 9 0 01-8-4.472"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Results table - only show if we have results */}

                  {bulkUploadResults && (
                    <div>
                      <div className="flex justify-between pb-2">
                        <h2>Upload Log</h2>
                      </div>
                      <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left border-b">
                                Status
                              </th>
                              <th className="px-4 py-2 text-left border-b">
                                Record
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Successful records */}
                            {bulkUploadResults.successRecords.map(
                              (record, index) => (
                                <tr
                                  key={`success-${index}`}
                                  className="bg-green-50 max-h-20 overflow-y-scroll"
                                >
                                  <td className="px-4 py-2 border-b text-green-600">
                                    Success
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {record}
                                  </td>
                                </tr>
                              )
                            )}

                            {/* Failed records */}
                            {bulkUploadResults.failedRecords.map(
                              (record, index) => (
                                <tr
                                  key={`failed-${index}`}
                                  className="bg-red-50 max-h-20 overflow-y-scroll"
                                >
                                  <td className="px-4 py-2 border-b text-red-600">
                                    Failed
                                  </td>
                                  <td className="px-4 py-2 border-b">
                                    {record}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;
