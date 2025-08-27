/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import customerService from "../../services/CustomerServices";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import Loader from "../Loader/Loader";
import SellerService from "../../services/SellerService";

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
  const [previewImages, setPreviewImages] = useState<string | null>(null);
  const [modelNoo, setmodelNoo] = useState<string>("");
const [change,setchange]=useState("");
const [purchase_id,setpurchase_id]=useState<number|null>(null);
  const [modelData, setModelData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loader, setloader] = useState(false);

  // const [pendingPayload, setPendingPayload] = useState<any>(null);
  // const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modelValid, setModelValid] = useState(false);

  const customerId = Number(localStorage.getItem("company_id"));
  const registerForm = useForm();
  const requestForm = useForm();

  const fetchRegistered = async () => {
    setloader(true);
    try {
      const data = await customerService.getRegisteredWarrantiesCompany(
        customerId,
        searchModelNo
      );

      setRegistered(data.content);

      const modelNos = [
        ...new Set(data.content.map((item: any) => String(item.model_no))),
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
        setloader(false);
      } else {
        setloader(false);
      }
    } catch (err: any) {
      toast.success("Failed to fetch products: " + err.message);
      setloader(false);
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
    fetchRegistered();
    fetchRequests();
  }, []);

  const handleDelete = async (purchaseId: number) => {
    try {
      const res = await customerService.deleteRegisteredWarranty(purchaseId);

      if (res.data?.message === "Cant Delete") {
        toast.error("Cannot delete this warranty.");
      } else {
        toast.success("Deleted Successfully");
        fetchRegistered();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Something went wrong while deleting."
      );
    }
  };

  const handleRegisterSubmit = async (data: any) => {
    const payload = { ...data, customerId };

    try {
      confirmAndSave(
        payload,
        data.model_no,
        !!editItem,
        editItem?.purchase_Id,
        data.serial_no
      );
    } catch (err: any) {
      toast.success(err.response?.data?.message || err.message);
    }
  };

  const confirmAndSave = async (
    payload: any,
    modelNo: any,
    isEdit: any,
    purchase_Id: any,
    serialNo: any
  ) => {
    try {
      // const { payload, modelNo, isEdit, purchase_Id } = pendingPayload;

      if (isEdit) {
        await customerService.editRegisteredWarranty(purchase_Id, payload);
        toast.success("Updated Successfully");
      } else {
        const Payload = {
          modelNo: modelNo,
          serialNos: [serialNo],
          itemStatus: 4,
        };
        await SellerService.postItemStatus(Payload).then((response: any) => {
          if (response.statusCode != 200) {
            toast("somethings went wrong");
            return;
          }
        });
        await customerService.registerWarranty(payload);
        //  await customerService.updateHolderStatus(modelNo, 4);
      }

      // Success cleanup
      setShowRegisterForm(false);
      setEditItem(null);
      registerForm.reset();
      fetchRegistered();
    } catch (err: any) {
      toast.success(err.response?.data?.message || err.message);
    } finally {
      //setShowConfirmModal(false);
      // setPendingPayload(null);
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
        company_id: modelData || 0,
        request_date: "2025-07-01",
        purchase_date: "2025-07-03",
        reason: data.reason || "No reason provided",
        product_images: base64Images,
      };

      await customerService.raiseWarrantyRequest(payload);
      await customerService.updateHolderStatus(data.model_no, 5);

      setShowRequestForm(false);
      requestForm.reset();
      setModelData(null);
      setModelValid(false);
      fetchRequests();
      setImages([]);
      toast.success("Request Submitted Successfully");
    } catch (err: any) {
      toast.success(err.response?.data?.message || err.message);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleApprovalChange = () => {
    const payload = {
      purchase_id: purchase_id,
      approval_status: change,
    };
    if (change) {
      customerService.changeApprovalStatus(payload).then((response)=>{
        if(response?.data?.statusCode==200){
          toast("Warranty Request Responded");
          setShowConfirmModal(false);
        }
      })
    }
  };


  const changehandleApprovalChange=(e: any, purchase_id: number)=>{
        const approvalvalue = e.target.value;
setpurchase_id(purchase_id);
setchange(approvalvalue);
    setShowConfirmModal(true);

  }

  return (
    <div className="p-4 max-w-screen bg-stone-200 min-h-screen text-gray-900">
      <Toaster />
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6">
        Registered Products
      </h1>

       {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            <p className="mb-4 text-gray-800">
              Are you sure you want to save the changes?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleApprovalChange}
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

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition ${
              activeTab === "registered"
                ? "bg-teal-500 text-white"
                : "bg-white border border-gray-300 text-gray-800 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("registered")}
          >
            Registered Products
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search Model No"
            value={searchModelNo}
            onChange={(e) => setSearchModelNo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchRegistered();
                fetchRequests();
              }
            }}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 w-full"
          />
          <button
            onClick={() => {
              fetchRegistered();
              fetchRequests();
            }}
            className="bg-teal-500 text-white px-3 py-1.5 text-sm rounded-md hover:bg-teal-700 transition"
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
            className="bg-teal-500 hover:bg-teal-700 text-white px-4 py-1.5 text-sm rounded-md"
          >
            + Register Product
          </button>
        ) : null}
      </div>

      {/* Registered Products */}
      {activeTab === "registered" && (
        <div className="grid grid-cols-5 gap-4">
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
                      <p className="text-sm">Serial No: {item.serial_no}</p>
                      <p className="text-sm">Price: ₹{product.product_price}</p>
                      <p className="text-sm">
                        Warranty: {product.warrany_tenure} months
                      </p>

                      {product.productImages &&
                      product.productImages.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          {product.productImages && (
                            <div className="p-1">
                              <img
                                className="h-28 w-auto object-contain rounded-md"
                                src={product.productImages[0]}
                              />
                            </div>
                          )}

                          <button
                            onClick={() => {
                              setPreviewImage(product.productImages[0]);
                              setmodelNoo(item.model_no);
                            }}
                            title="view more"
                            className="text-gray-600 hover:text-gray-800 bg-white text-sm p-2 flex items-center justify-center transition duration-200 ease-in-out"
                          >
                            <span className="text-sm font-medium text-blue-700 ">
                              View More
                            </span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          No images
                        </span>
                      )}
                      <p>
                        <select
                          className="bg-stone-200 rounded-md p-1"
                          onChange={(e) =>
                            changehandleApprovalChange(e, item.purchase_Id)
                          }
                          defaultValue={item?.companyapprovalstatus || ""}
                        >
                          <option value="">Pending</option>
                          <option value="1">Approve</option>
                          <option value="2">Reject</option>
                        </select>
                      </p>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 col-span-full py-4 flex items-center justify-center h-96">
              {loader ? <Loader /> : <div>No registered warranties found.</div>}
            </p>
          )}
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-gray-800 mb-4">
              Are you sure you want to delete this item?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  if (deleteId !== null) {
                    handleDelete(deleteId); // Call your delete logic
                  }
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {(previewImage || previewImages) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl relative max-w-xl w-full">
            <button
              onClick={() => {
                setPreviewImage(null);
                setPreviewImages(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-blue-100 bg-white"
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
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Product Preview"
                  className="object-contain rounded-lg mx-auto max-w-full"
                />
              )}
              {previewImages && (
                <img
                  src={previewImages}
                  alt="Product Preview"
                  className="object-contain rounded-lg mx-auto max-w-full"
                />
              )}
            </div>

            {/* Thumbnail Gallery */}
            {(() => {
              const foundProduct = previewImage
                ? products.find((p) => p.model_no?.includes(modelNoo))
                : previewImages
                ? requests.find((p) => p.model_no?.includes(modelNoo))
                : null;

              return foundProduct &&
                foundProduct.productImages &&
                foundProduct.productImages.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {foundProduct.productImages.map(
                    (img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (previewImage) {
                            setPreviewImage(img);
                            setPreviewImages(null); // optional: reset the other state
                          } else {
                            setPreviewImages(img);
                            setPreviewImage(null); // optional: reset the other state
                          }
                        }}
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
                    )
                  )}
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
                className="text-gray-400 hover:text-gray-600 bg-white"
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
                  Serial No
                </label>
                <input
                  {...registerForm.register("serial_no")}
                  placeholder="Serial No"
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
                  max={new Date().toISOString().split("T")[0]}
                  required
                  className="text-sm p-2 border border-gray-300 rounded w-full bg-blue-200 focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-700 text-white py-2 rounded text-sm"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
      {/* {showConfirmModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
      <p className="mb-4 text-gray-800">Are you sure you want to save the changes?</p>
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
            setPendingPayload(null);
          }}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          No
        </button>
      </div>
    </div>
  </div>
)} */}

      {/* Warranty Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Raise Warranty Request</h3>
              <button
                onClick={() => {
                  setShowRequestForm(false);
                  requestForm.reset();
                }}
                className="text-gray-400 hover:text-gray-600 bg-white"
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
              <div className="flex flex-row w-full justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model No
                  </label>
                  <input
                    {...requestForm.register("model_no")}
                    placeholder="Model No"
                    required
                    disabled
                    className="text-sm p-2 border border-gray-300 rounded w-full bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial No
                  </label>
                  <input
                    {...requestForm.register("serial_no")}
                    placeholder="Serial No"
                    required
                    disabled
                    className="text-sm p-2 border border-gray-300 rounded w-full bg-white"
                  />
                </div>
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
                className="w-full bg-teal-500 hover:bg-teal-700 text-white py-2 rounded text-sm"
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
