/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import customerService from "../../services/CustomerServices";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import Loader from "../Loader/Loader";
import SellerService from "../../services/SellerService";
import { useParams } from "react-router-dom";

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

  const [modelData, setModelData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const [loader, setloader] = useState(false);

  // const [pendingPayload, setPendingPayload] = useState<any>(null);
  // const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modelValid, setModelValid] = useState(false);
   const Id = useParams();

  const customerId = Number(localStorage.getItem("user_id"))|| parseInt(Id.Id ?? "");
  const registerForm = useForm();
  const requestForm = useForm();
const user_name=localStorage.getItem("user_name");
const user_email=localStorage.getItem("user_email");

  const fetchRegistered = async () => {
    setloader(true);
    try {
      const data = await customerService.getRegisteredWarranties(
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

  // Fetches warranty requests raised by customer.
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
  
  // Handles deleting a registered warranty
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

  // const handleRegisterSubmit = async (data: any) => {
  //   const payload = { ...data, customerId };
  //   try {
  //     const eligible = await customerService.checkEligibility(data.model_no, 4);
  //     if (!eligible&&!editItem) {
  //       toast.success(
  //         "You are not eligible to register this product. Please contact support."
  //       );
  //       return;
  //     }

  //     if (editItem) {
  //       await customerService.editRegisteredWarranty(
  //         editItem.purchase_Id,
  //         payload
  //       );
  //     } else {
  //       await customerService.registerWarranty(payload);
  //       await customerService.updateHolderStatus(data.model_no, 4);
  //     }

  //     setShowRegisterForm(false);
  //     setEditItem(null);
  //     registerForm.reset();
  //     fetchRegistered();
  //   } catch (err: any) {
  //     toast.success(err.response?.data?.message || err.message);
  //   }
  // };

  // Handles product registration form submission.
  const handleRegisterSubmit = async (data: any) => {

    try {
      // const eligible = await customerService.checkEligibility(data.model_no, 4);

      // // If not eligible (and not editing), block immediately
      // if (!eligible && !editItem) {
      //   toast.success("You are not eligible to register this product. Please contact support.");
      //   return;
      // }

      // Store the payload for later and show confirmation dialog
      // setPendingPayload({ payload, modelNo: data.model_no, isEdit: !!editItem, purchase_Id: editItem?.purchase_Id });
      //setShowConfirmModal(true);
await SellerService.getProductByModelNoNoImage(data.model_no).then((response)=>{
      const payload = { ...data, customerId,company_id: response?.company_id};

 confirmAndSave(
  //response?.data?.company_id,
        payload,
        data.model_no,
        !!editItem,
        editItem?.purchase_Id,
        data.serial_no
      );
})

     
    } catch (err: any) {
      toast.success(err.response?.data?.message || err.message);
    }
  };

  const confirmAndSave = async (
   // companyId:any,
    payload: any,
    modelNo: any,
    isEdit: any,
    purchase_Id: any,
    serialNo: any
  ) => {
    try {
      // const { payload, modelNo, isEdit, purchase_Id } = pendingPayload;

      if (isEdit) {
        // Edit existing registration
        await customerService.editRegisteredWarranty(purchase_Id, payload);
        toast.success("Updated Successfully");
      } else {
        // Update seller item status and register warranty
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

  // Converts an uploaded file to Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handles warranty request form submission.
  //Uploads images in base64 format.
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
        raisedon_date: new Date().toISOString().split("T")[0],
      };

      // const eligible = await customerService.checkEligibility(data.model_no, 5);
      // if (!eligible) {
      //   toast.success(
      //     "You are not eligible to raise a warranty request for this product."
      //   );
      //   return;
      // }

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

  // Opens the request form with pre-filled values for model and serial.
  const handleRaiseRequest = (
    purchaseId: number,
    modelNo: string,
    company_id: string,
    serialNo:string
  ) => {
    setModelData(company_id);
    setShowRequestForm(true);
    requestForm.setValue("serial_no",serialNo)
    requestForm.setValue("model_no", modelNo);
    requestForm.setValue("customer_name",user_name);
    requestForm.setValue("customer_email",user_email);
  };

  // Handles image input change for request form.
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  return (
    <div className="p-4 max-w-screen bg-stone-200 min-h-screen text-gray-900">
      <Toaster />
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6">
        Registered Products
      </h1>

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
          <button
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition ${
              activeTab === "requests"
                ? "bg-teal-500 text-white"
                : "bg-white border border-gray-300 text-gray-800 hover:bg-blue-50"
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
                            {/* <svg
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
                            </svg> */}
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
                    </>
                  )}

                  <div className="flex space-x-2 mt-3">
                    {/* <button
                      onClick={() => handleEdit(item)}
                      className="text-white hover:text-gray-900 p-1 rounded hover:bg-blue-100"
                      title="Edit"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button> */}
                    <button
                      onClick={() => {
                        setDeleteId(item.purchase_Id);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-white hover:text-red-600 p-1 rounded hover:bg-blue-100"
                      title="Delete"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    {item.companyapprovalstatus == 1 ? (
                      <button
                        disabled={item.companyapprovalstatus == 0||item.companyapprovalstatus==2}
                        onClick={() =>
                          handleRaiseRequest(
                            item.purchase_Id,
                            item.model_no,
                            product.company_id,
                            item.serial_no
                          )
                        }
                        className="text-xs bg-teal-500 hover:bg-teal-700 text-white px-2 py-1 rounded"
                      >
                        Request
                      </button>
                    )
                    :(
<span className="text-xs bg-teal-500 hover:bg-teal-700 text-white px-2 py-1 rounded cursor-not-allowed">Request Pending</span>
                    ) 
                    }
                  </div>
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

      {/* Warranty Requests */}
      {activeTab === "requests" && (
        <div className="grid grid-cols-5 gap-4">
          {requests.length > 0 ? (
            requests.map((req) => {
              const product = productDetailsMap[req.model_no] || {};
              return (
                <div
                  key={req.warranty_request_id}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                      {product.productImages && (
                        <div className="p-1">
                          <img
                            className="h-28 w-auto object-contain rounded-md"
                            src={product.productImages[0]}
                          />
                        </div>
                      )}

                      <p className="text-sm font-semibold text-gray-800">
                        Model: {req.model_no}
                      </p>
                    </div>
                    {product.productImages && (
                      <button
                        onClick={() => {
                          setPreviewImage(product.productImages[0]);
                          setmodelNoo(product.model_no);
                        }}
                        className="text-xs text-blue-600 hover:underline bg-white"
                      >
                        View More
                      </button>
                    )}
                  </div>

                  {/* Customer Info */}
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Customer:</span>{" "}
                    {req.customer_name}
                  </p>

                  {/* Warranty Status */}
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-1 font-semibold ${
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

                  {/* Company Remarks */}
                  <p className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Remarks:</span>{" "}
                    {req.rejection_remark && req.rejection_remark}{" "}
                    {!req.rejection_remark && "No Remarks"}
                  </p>
<p className="text-sm text-gray-500">
                    <span className="font-medium">Requested date:</span>{" "}
                    {req.raisedon_date || "No Date provided"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Reason:</span>{" "}
                    {req.reason || "No reason provided"}
                  </p>

                  {/* Uploaded Image Button */}
                  <button
                    onClick={() => {
                      setPreviewImages(req.productImages[0]);
                      setmodelNoo(req.model_no);
                    }}
                    className="text-xs text-blue-600 hover:underline mb-3 bg-white"
                  >
                    View Uploaded Image
                  </button>

                  {/* Product Info */}
                  {product.product_name && (
                    <>
                      <hr className="my-3 border-gray-200" />

                      <div className="space-y-1 text-sm text-gray-700">
                        <p>
                          <span className="font-medium">Product Name:</span>{" "}
                          {product.product_name}
                        </p>
                        <p>
                          <span className="font-medium">Price:</span> ₹
                          {product.product_price}
                        </p>
                      </div>
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
                  Model No<span className="text-red-500">*</span>
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
                  Serial No<span className="text-red-500">*</span>
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
                  Purchase Date<span className="text-red-500">*</span>
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
                Send Registration Request
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
              <h3 className="text-lg font-medium">Warranty Claim</h3>
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
                  Phone<span className="text-red-500">*</span>
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
                  Upload Image<span className="text-red-500">*</span>
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
                  Reason<span className="text-red-500">*</span>
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
               Send Warranty Claim Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerWarrantyPage;
