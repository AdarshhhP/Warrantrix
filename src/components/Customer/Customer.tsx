/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import customerService from "../../services/CustomerServices";

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

const CustomerWarrantyPage = () => {
  const [activeTab, setActiveTab] = useState<"registered" | "requests">(
    "registered"
  );
  const [registered, setRegistered] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [productDetailsMap, setProductDetailsMap] = useState<
    Record<string, any>
  >({});
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [searchModelNo, setSearchModelNo] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [modelData, setModelData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<File[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modelValid, setModelValid] = useState(false);

  const customerId = Number(localStorage.getItem("user_id"));

  const registerForm = useForm();
  const requestForm = useForm();

  const fetchRegistered = async () => {
    try {
      const data = await customerService.getRegisteredWarranties(
        customerId,
        searchModelNo
      );
      setRegistered(data);

      const modelNos = [
        ...new Set(data.map((item: any) => String(item.model_no))),
      ] as string[];
      if (modelNos.length > 0) {
        const productDetails = await customerService.getProductDetailsByModels(
          modelNos
        );
        const productMap: Record<string, any> = {};
        productDetails.forEach(
          (prod: any) => (productMap[prod.model_no] = prod)
        );
        setProductDetailsMap((prev) => ({ ...prev, ...productMap }));
        const productsWithImages = productDetails.map((product: any) => ({
          ...product,
          productImages: product.productImages || [],
        }));
        setProducts(productsWithImages);
      }
    } catch (err: any) {
      alert("Failed to fetch products: " + err.message);
    }
  };

  const fetchRequests = async () => {
    const data = await customerService.getWarrantyRequests(
      customerId,
      searchModelNo
    );
    setRequests(data);

    const modelNos = [
      ...new Set(data.map((req: any) => String(req.model_no))),
    ] as string[];
    if (modelNos.length > 0) {
      const productDetails = await customerService.getProductDetailsByModels(
        modelNos
      );
      const productMap: Record<string, any> = {};
      productDetails.forEach((prod: any) => (productMap[prod.model_no] = prod));
      setProductDetailsMap((prev) => ({ ...prev, ...productMap }));
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchRegistered();
      fetchRequests();
    }
  }, [customerId]);

  const handleEdit = (item: any) => {
    setEditItem(item);
    registerForm.setValue("model_no", item.model_no);
    registerForm.setValue("purchase_date", item.purchase_date);
    setShowRegisterForm(true);
  };

  const handleDelete = async (purchaseId: number) => {
    try {
      const res = await customerService.deleteRegisteredWarranty(purchaseId);
      if (res.data?.message === "Cant Delete") {
        alert("Cannot delete this warranty");
      } else {
        fetchRegistered();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRegisterSubmit = async (data: any) => {
    const payload = { ...data, customerId };
    try {
      const eligible = await customerService.checkEligibility(data.model_no, 4);
      if (!eligible) {
        alert(
          "You are not eligible to register this product. Please contact support."
        );
        return;
      }

      if (editItem) {
        await customerService.editRegisteredWarranty(
          editItem.purchase_Id,
          payload
        );
      } else {
        await customerService.registerWarranty(payload);
        await customerService.updateHolderStatus(data.model_no, 4);
      }

      setShowRegisterForm(false);
      setEditItem(null);
      registerForm.reset();
      fetchRegistered();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRequestSubmit = async (data: any) => {
    try {
      const base64Images = await Promise.all(
        images.map((file) => convertToBase64(file))
      );
      const payload = {
        ...data,
        customer_id: customerId,
        company_id: modelData?.company_id || 0,
        request_date: "2025-07-01",
        purchase_date: "2025-07-03",
        reason: data.reason || "No reason provided",
        product_images: base64Images,
      };

      const eligible = await customerService.checkEligibility(data.model_no, 5);
      if (!eligible) {
        alert(
          "You are not eligible to raise a warranty request for this product."
        );
        return;
      }

      await customerService.raiseWarrantyRequest(payload);
      await customerService.updateHolderStatus(data.model_no, 5);

      setShowRequestForm(false);
      requestForm.reset();
      setModelData(null);
      setModelValid(false);
      fetchRequests();
      setImages([]);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRaiseRequest = (purchaseId: number, modelNo: string) => {
    setShowRequestForm(true);
    requestForm.setValue("model_no", modelNo);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  return (
    <div className="p-4 max-w-screen bg-white min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
        Customer Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition ${
              activeTab === "registered"
                ? "bg-gray-800 text-white"
                : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("registered")}
          >
            Registered Products
          </button>
          <button
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition ${
              activeTab === "requests"
                ? "bg-gray-800 text-white"
                : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            Warranty Requests
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search Model No"
            value={searchModelNo}
            onChange={(e) => setSearchModelNo(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 w-full"
          />
          <button
            onClick={() => {
              fetchRegistered();
              fetchRequests();
            }}
            className="bg-gray-800 text-white px-3 py-1.5 text-sm rounded-md hover:bg-gray-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-4 flex justify-end">
        {activeTab === "registered" ? (
          <button
            onClick={() => {
              registerForm.reset();
              setEditItem(null);
              setShowRegisterForm(true);
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 text-sm rounded-md"
          >
            + Register Product
          </button>
        ) : null}
      </div>

      {/* Registered Products */}
      {activeTab === "registered" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registered.length > 0 ? (
            registered.map((item) => {
              const product = productDetailsMap[item.model_no] || {};
              return (
                <div
                  key={item.purchase_Id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">
                      Model: {item.model_no}
                    </p>
                    {product.product_image && (
                      <button
                        onClick={() => setPreviewImage(product.product_image)}
                        className="text-white text-xs"
                      >
                        View Image
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-2">
                    Purchased: {item.purchase_date}
                  </p>

                  {product.product_name && (
                    <>
                      <div className="border-t border-gray-100 my-2"></div>
                      <p className="text-sm">Name: {product.product_name}</p>
                      <p className="text-sm">Price: ₹{product.product_price}</p>
                      <p className="text-sm">
                        Warranty: {product.warrany_tenure} years
                      </p>

                      {product.productImages &&
                      product.productImages.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            View Image
                          </span>

                          <button
                            onClick={() =>
                              setPreviewImage(product.productImages[0])
                            }
                            className="text-gray-600 hover:text-gray-800 bg-white text-sm p-2 flex items-center justify-center transition duration-200 ease-in-out"
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
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          No images
                        </span>
                      )}
                    </>
                  )}

                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.purchase_Id)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        handleRaiseRequest(item.purchase_Id, item.model_no)
                      }
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      Request
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 col-span-full py-4">
              No registered warranties found.
            </p>
          )}
        </div>
      )}

      {/* Warranty Requests */}
      {activeTab === "requests" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.length > 0 ? (
            requests.map((req) => {
              const product = productDetailsMap[req.model_no] || {};
              return (
                <div
                  key={req.warranty_request_id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Model: {req.model_no}</p>
                    {product.product_image && (
                      <button
                        onClick={() => setPreviewImage(product.product_image)}
                        className="text-white text-xs"
                      >
                        View Image
                      </button>
                    )}
                  </div>

                  <p className="text-sm">Name: {req.customer_name}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    Status:
                    <span
                      className={`ml-1 ${
                        req.warranty_status === 1
                          ? "text-yellow-600"
                          : req.warranty_status === 2
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {req.warranty_status === 1
                        ? "Pending"
                        : req.warranty_status === 2
                        ? "Approved"
                        : "Rejected"}
                    </span>
                  </p>

                  {product.product_name && (
                    <>
                      <div className="border-t border-gray-100 my-2"></div>
                      <p className="text-sm">Product: {product.product_name}</p>
                      <p className="text-sm">Price: ₹{product.product_price}</p>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 col-span-full py-4">
              No warranty requests found.
            </p>
          )}
        </div>
      )}

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

      {/* Register Form Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">
                {editItem ? "Edit Product" : "Register Product"}
              </h3>
              <button
                onClick={() => {
                  setShowRegisterForm(false);
                  setEditItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model No
                </label>
                <input
                  {...registerForm.register("model_no")}
                  placeholder="Model No"
                  required
                  className="text-sm p-2 border border-gray-300 rounded w-full bg-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date
                </label>
                <input
                  {...registerForm.register("purchase_date")}
                  type="date"
                  required
                  className="text-sm p-2 border border-gray-300 rounded w-full bg-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded text-sm"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Warranty Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Raise Warranty Request</h3>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model No
                </label>
                <input
                  {...requestForm.register("model_no")}
                  placeholder="Model No"
                  required
                  disabled
                  className="text-sm p-2 border border-gray-300 rounded w-full bg-white bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  {...requestForm.register("customer_name")}
                  placeholder="Your Name"
                  required
                  className="text-sm p-2 border border-gray-300 rounded w-full bg-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email
                </label>
                <input
                  {...requestForm.register("customer_email")}
                  placeholder="Your Email"
                  required
                  className="text-sm p-2 border border-gray-300 rounded w-full bg-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  {...requestForm.register("phone_number")}
                  type="tel"
                  placeholder="Phone"
                  required
                  className="text-sm p-2 border border-gray-300 rounded w-full bg-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  Reason
                </label>
                <input
                  {...requestForm.register("reason")}
                  placeholder="Reason for Request"
                  required
                  className="text-sm p-2 border border-gray-300 rounded w-full bg-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded text-sm"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerWarrantyPage;
