/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import companyService from "../../services/CompanyServices";

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
};

const Company = () => {
  const [activeTab, setActiveTab] = useState<"products" | "requests">(
    "products"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<WarrantyRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageREquest, setpreviewImageREquest] = useState<string | null>(
    null
  );
  const [holderStatus, setHolderStatus] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [modelNo, setModelNo] = useState("");
  const [astatus, setAstatus] = useState("");
  const [amodelNo, setAmodelNo] = useState("");

  const { register, handleSubmit, reset } = useForm<Product>();
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
        modelNo,
        page: 0,
        size: 1000,
      });
      const productsWithImages = data.map((product: any) => ({
        ...product,
        productImages: product.productImages || [],
      }));

      setProducts(productsWithImages);
    } catch (err: any) {
      alert("Failed to fetch products: " + err.message);
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
      alert("Failed to fetch warranty requests: " + err.message);
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
      alert("Product added!");
      reset();
      setShowForm(false);
      setImages([]);
      fetchProducts();
    } catch (error: any) {
      alert("Error adding product: " + error.message);
    }
  };

  const handleStatusChange = async (status: any, requestId: number) => {
    try {
      await companyService.updateWarrantyStatus(requestId, status);
      fetchRequests();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleReset = () => {
    setModelNo("");
    setHolderStatus("");
    setProductCategory("");
    setAstatus("");
    setAmodelNo("");
    fetchProducts();
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Company Dashboard
        </h1>

        {activeTab === "products" && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
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
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "products"
                ? "bg-gray-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "requests"
                ? "bg-gray-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Warranty Requests
          </button>
        </div>

        {/* Search Filters */}
        {activeTab === "requests" && (
          <div className="flex justify-end w-full gap-3 p-3 bg-white rounded-lg shadow-xs border border-gray-100">
            <input
              type="text"
              value={amodelNo}
              onChange={(e) => setAmodelNo(e.target.value)}
              placeholder="Model No"
              className="text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 w-full md:w-48 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
            />
            <select
              value={astatus}
              onChange={(e) => setAstatus(e.target.value)}
              className="text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 w-full md:w-40 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
            >
              <option value="">All Statuses</option>
              <option value="1">Pending</option>
              <option value="2">Approved</option>
              <option value="3">Rejected</option>
            </select>
            <button
              onClick={fetchRequests}
              className="bg-gray-600 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors duration-200 w-full flex items-center justify-center gap-2"
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
              Search
            </button>
          </div>
        )}

        {activeTab === "products" && (
          <div className="flex items-center justify-end gap-3 p-3 bg-white rounded-lg shadow-xs border border-gray-100 w-full">
            <input
              type="text"
              value={modelNo}
              onChange={(e) => setModelNo(e.target.value)}
              placeholder="Model No"
              className="text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 w-full md:w-48 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
            />
            <select
              value={holderStatus}
              onChange={(e) => setHolderStatus(e.target.value)}
              className="text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 w-full md:w-40 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
            >
              <option value="">All Statuses</option>
              <option value="1">In Company Stocks</option>
              <option value="2">With Retail Seller</option>
              <option value="3">Sold To Customer</option>
              <option value="4">With Customer</option>
              <option value="5">Raised Warranty Request</option>
            </select>
            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 w-full md:w-40 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
            >
              <option value="">All Categories</option>
              <option value="1">Electronics</option>
              <option value="2">Plastic</option>
              <option value="3">Wood</option>
              <option value="4">Metal</option>
            </select>
            <button
              onClick={fetchProducts}
              className="bg-gray-600 text-white px-8 py-1.5 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2"
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
              Search
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-8 py-1.5 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
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
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl relative max-w-4xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
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
                src={previewImage}
                alt="Product Preview"
                className="object-contain rounded-lg mx-auto max-w-full"
              />
            </div>

            {/* Thumbnail Gallery */}
            {(() => {
              const foundProduct = products.find((p) =>
                p.productImages?.includes(previewImage)
              );
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

      {/* Products Grid */}
      {activeTab === "products" && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                className="mt-4 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
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
                className="bg-white shadow-sm rounded-xl p-5 space-y-3 border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {product.product_name}
                  </h2>
                  {product.productImages && product.productImages.length > 0 ? (
                    <button
                      onClick={() => setPreviewImage(product.productImages[0])}
                      className="text-gray-600 hover:text-gray-800 text-sm rounded-full bg-white flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      No images
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
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
                    Model: {product.model_no}
                  </p>

                  <p className="text-sm text-gray-800 font-medium flex items-center gap-2">
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ₹{product.product_price}
                  </p>

                  <p className="text-sm flex items-center gap-2">
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
                    Warranty: {product.warrany_tenure} months
                  </p>

                  <p className="text-sm flex items-center gap-2">
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Category:{" "}
                    {categories.find((c) => c.id === product.product_category)
                      ?.name || "Unknown"}
                  </p>

                  <div className="flex items-center gap-2">
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span
                      className={`text-sm font-medium ${
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
                          : "text-gray-600"
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
                  </div>

                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-400"
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
                    Mfg Date: {product.man_date}
                  </p>
                  {product.productImages && (
                    <button
                      onClick={() => setPreviewImage(product.productImages[0])}
                      className="text-white text-xs"
                    >
                      View Image
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
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

      {/* Requests Grid */}
      {activeTab === "requests" && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                className="bg-white shadow-sm rounded-xl p-5 space-y-3 border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <h2 className="text-lg font-semibold text-gray-800">
                  {req.customer_name}
                </h2>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
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
                  {req.productImages && (
                    <button
                      onClick={() => setPreviewImage(req.productImages[0])}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1 bg-white"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm flex items-center gap-2">
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

                  <p className="text-sm flex items-center gap-2">
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

                  <p className="text-sm flex items-center gap-2">
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

                  <p className="text-sm flex items-center gap-2">
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
                      className={`font-medium ${
                        req.warranty_status === 1
                          ? "text-amber-500"
                          : req.warranty_status === 2
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
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
                      className="text-white text-xs"
                    >
                      View Image
                    </button>
                  )}

                  <p className="text-xs text-gray-500 flex items-start gap-2">
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
                    Reason: {req.reason}
                  </p>
                </div>

                <select
                  value={req.warranty_status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value, req.warranty_request_id)
                  }
                  className={`w-full border px-3 py-2 rounded-lg mt-2 font-medium focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition ${
                    req.warranty_status === 1
                      ? "border-amber-200 bg-amber-50"
                      : req.warranty_status === 2
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <option value="1" disabled>
                    Pending
                  </option>
                  <option value="2">Approved</option>
                  <option value="3">Rejected</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-4 py-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Add New Product
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
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
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      {...register("product_name")}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                      placeholder="Product Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Category
                    </label>
                    <select
                      {...register("product_category")}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
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
                    <label className="block mb-1 text-gray-700">
                      Upload Image
                    </label>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="w-full border px-4 py-2 rounded-lg"
                      />
                      <span onClick={() => setImages([])}>Clear</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model No
                    </label>
                    <input
                      {...register("model_no")}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
                      placeholder="Model Number"
                    />
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
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition bg-white"
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
                      className="w-full border bg-gray-300 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg w-full hover:bg-gray-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;
