/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import customerService from "../../services/CustomerServices";

const CustomerWarrantyPage = () => {
  const [activeTab, setActiveTab] = useState<"registered" | "requests">("registered");
  const [registered, setRegistered] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [productDetailsMap, setProductDetailsMap] = useState<Record<string, any>>({});
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [searchModelNo, setSearchModelNo] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [modelData, setModelData] = useState<any>(null);
  const [modelValid, setModelValid] = useState(false);

  const customerId = Number(localStorage.getItem("user_id"));

  const registerForm = useForm();
  const requestForm = useForm();

  const fetchRegistered = async () => {
    const data = await customerService.getRegisteredWarranties(customerId, searchModelNo);
    setRegistered(data);

    const modelNos = [...new Set(data.map((item: any) => String(item.model_no)))] as string[];
    if (modelNos.length > 0) {
      const productDetails = await customerService.getProductDetailsByModels(modelNos);
      const productMap: Record<string, any> = {};
      productDetails.forEach((prod: any) => (productMap[prod.model_no] = prod));
      setProductDetailsMap((prev) => ({ ...prev, ...productMap }));
    }
  };

  const fetchRequests = async () => {
    const data = await customerService.getWarrantyRequests(customerId, searchModelNo);
    setRequests(data);

    const modelNos = [...new Set(data.map((req: any) => String(req.model_no)))] as string[];
    if (modelNos.length > 0) {
      const productDetails = await customerService.getProductDetailsByModels(modelNos);
      const productMap: Record<string, any> = {};
      productDetails.forEach((prod:any) => (productMap[prod.model_no] = prod));
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
        alert("You are not eligible to register this product. Please contact support.");
        return;
      }

      if (editItem) {
        await customerService.editRegisteredWarranty(editItem.purchase_Id, payload);
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
      const base64Image = await convertToBase64(data.image[0]);
      const payload = {
        ...data,
        customer_id: customerId,
        company_id: modelData?.company_id || 0,
        request_date: "2025-07-01",
        purchase_date: "2025-07-03",
        reason: data.reason || "No reason provided",
        image: base64Image,
      };

      const eligible = await customerService.checkEligibility(data.model_no, 5);
      if (!eligible) {
        alert("You are not eligible to raise a warranty request for this product.");
        return;
      }

      await customerService.raiseWarrantyRequest(payload);
      await customerService.updateHolderStatus(data.model_no, 5);

      setShowRequestForm(false);
      requestForm.reset();
      setModelData(null);
      setModelValid(false);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRaiseRequest = (purchaseId: number, modelNo: string) => {
    setShowRequestForm(true);
    requestForm.setValue("model_no", modelNo);
  };

  // Keep all the existing UI rendering code (tabs, modals, lists, etc.) here unchanged
  // since it's not necessary to rewrite the entire JSX if only service refactoring is needed

 return (
 <div className="p-6 max-w-screen bg-white h-fit text-gray-800">
  <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">Customer Dashboard</h1>

  {/* Tabs */}
  <div className="flex justify-between items-center mb-6">
    <div className="space-x-4">
      <button
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "registered"
            ? "bg-gray-900 text-white shadow"
            : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("registered")}
      >
        Registered Products
      </button>
      <button
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "requests"
            ? "bg-gray-900 text-white shadow"
            : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("requests")}
      >
        Warranty Requests
      </button>
    </div>

<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
  {/* Search Section */}
  <div className="flex items-center gap-2">
    <input
      type="text"
      placeholder="Search Model No"
      onChange={(e) => setSearchModelNo(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm text-gray-800"
    />
    <button
      onClick={() => {fetchRequests();
        fetchRegistered()}
      }
      className="bg-gray-900 text-white px-4 py-2 rounded-md shadow hover:bg-gray-700 transition duration-200 text-sm"
    >
      Search
    </button>
  </div>

  {/* Action Button */}
  {activeTab === "registered" ? (
    <button
      onClick={() => {
        registerForm.reset();
        setEditItem(null);
        setShowRegisterForm(true);
      }}
      className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-full shadow text-sm"
    >
      + Register Product
    </button>
  ) : (
    // <button
    //   onClick={() => {
    //     requestForm.reset();
    //     setModelValid(false);
    //     setShowRequestForm(true);
    //   }}
    //   className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-full shadow text-sm"
    // >
    //   + Raise Request
    // </button>
    <div>

    </div>
  )}
</div>

  </div>

  {/* Registered Products */}
{activeTab === "registered" && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {registered.length > 0 ? (
      registered.map((item) => {
        const product = productDetailsMap[item.model_no] || {};
        return (
          <div
            key={item.purchase_Id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg relative"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-medium">Model: {item.model_no}</p>
              <button
                onClick={() => setPreviewImage(product.product_image)}
                className="text-blue-600 underline text-sm hover:text-blue-800 transition"
              >
                View Image
              </button>
            </div>

            <p>Purchase Date: {item.purchase_date}</p>

            {product.product_name && (
              <>
                <hr className="my-3" />
                <p>Product Name: {product.product_name}</p>
                <p>Price: ₹{product.product_price}</p>
                <p>Warranty: {product.warrany_tenure} years</p>
                <p>Manufactured: {product.man_date}</p>
              </>
            )}

            <div className="absolute top-2 right-2 space-x-3 text-sm font-medium">
              <button
                onClick={() => handleEdit(item)}
                className="text-gray-700 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.purchase_Id)}
                className="text-gray-700 hover:underline"
              >
                Delete
              </button>
              <button
                onClick={() =>
                  handleRaiseRequest(item.purchase_Id, item.model_no)
                }
                className="text-gray-700 hover:underline"
              >
                Request
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-center text-gray-500 col-span-full">
        No registered warranties found.
      </p>
    )}
  </div>
)}


    {previewImage && (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg relative">
        <button
          onClick={() => setPreviewImage(null)}
          className="absolute top-1 right-2 text-xl text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        <div className="max-w-[600px] max-h-[600px]">
  <img
    src={previewImage}
    alt="Product Preview"
    className="object-contain rounded max-w-full max-h-[80vh]"
  />
</div>

      </div>
    </div>
  )}

  {/* Warranty Requests */}
 {activeTab === "requests" && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {requests.length > 0 ? (
      requests.map((req) => {
        const product = productDetailsMap[req.model_no] || {};
        return (
          <div
            key={req.warranty_request_id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-medium">Model: {req.model_no}</p>
              <button
                onClick={() => setPreviewImage(product.product_image)}
                className="text-blue-600 underline text-sm hover:text-blue-800 transition"
              >
                View Image
              </button>
            </div>

            <p>Name: {req.customer_name}</p>
            <p>Email: {req.customer_email}</p>

            <p>
              Status:{" "}
              <span className="text-gray-700">
                {req.warranty_status === 1
                  ? "Pending"
                  : req.warranty_status === 2
                  ? "Approved"
                  : "Rejected"}
              </span>
            </p>

            {product.product_name && (
              <>
                <hr className="my-3" />
                <p>Product Name: {product.product_name}</p>
                <p>Price: ₹{product.product_price}</p>
                <p>Warranty: {product.warrany_tenure} years</p>
                <p>Manufactured: {product.man_date}</p>
              </>
            )}
          </div>
        );
      })
    ) : (
      <p className="text-center text-gray-500 col-span-full">
        No warranty requests found.
      </p>
    )}
  </div>
)}


  {/* Register Form Modal */}
  {showRegisterForm && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {editItem ? "Edit Registered Product" : "Register Product"}
          </h3>
          <button
            onClick={() => {
              setShowRegisterForm(false);
              setEditItem(null);
            }}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
          className="space-y-4"
        >
          <label>Model No</label>
          <input
            {...registerForm.register("model_no")}
            placeholder="Model No"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <label>Purchase Date</label>
          <input
            {...registerForm.register("purchase_date")}
            type="date"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <button
            type="submit"
            className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded w-full"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )}

  {/* Warranty Request Form Modal */}
  {showRequestForm && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Raise Warranty Request</h3>
          <button
            onClick={() => setShowRequestForm(false)}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
          className="space-y-4"
        >
          <div className="flex gap-2">
            <input
              {...requestForm.register("model_no")}
              placeholder="Model No"
              required
              className="p-2 border border-gray-300 rounded w-full"
              disabled
            />
            {/* <button
              type="button"
              onClick={() =>
                fetchModelDetails(requestForm.getValues("model_no"))
              }
              className="bg-gray-900 hover:bg-gray-700 text-white px-3 rounded"
            >
              Fetch
            </button> */}
          </div>
          <input
            {...requestForm.register("customer_name")}
            placeholder="Your Name"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            {...requestForm.register("customer_email")}
            placeholder="Your Email"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            {...requestForm.register("phone_number")}
            type="number"
            placeholder="Phone"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />


 <div>
                <label className="block mb-1 text-gray-700">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...requestForm.register("image", { required: true })}
                  className="w-full border px-4 py-2 rounded-lg"
                />
              </div>


          <input
            {...requestForm.register("reason")}
            placeholder="Reason for Request"
            required
            className="p-2 border border-gray-300 rounded w-full"
          />
          <button
            type="submit"
            // disabled={!modelValid}
            className={`w-full py-2 rounded transition ${
              modelValid
                ? "bg-gray-900 hover:bg-gray-700 text-white"
                : "bg-gray-900 hover:bg-gray-700 text-white"
            }`}
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

