/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import SellerService from "../../services/SellerService";
import TemplateGenerator, {
  type Columns,
} from "../BulkUpload/TemplateGenerator";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import Loader from "../Loader/Loader";
import companyService from "../../services/CompanyServices";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface ProductDetails {
  productSerials: ProductSerial[];
  serial_no: string;
  company_id: number;
  holderStatus: number;
  man_date: string; // or Date if you parse it
  model_no: string;
  prod_id: number;
  productImages: string[]; // base64-encoded image strings
  product_category: string; // if it's numeric, change to `number`
  product_name: string;
  product_price: number;
  warrany_tenure: number;
}
export interface ProductSerial {
  prod_id: number;
  serialNo: string;
  is_sold: number; // you could make this boolean if 0/1 is mapped
  model_No: string;
  itemsStatus: number;
}

export interface BulkUploadResponse {
  message: string; // e.g. ".xlsx"
  statusCode: number; // e.g. 509
  successRecords: string[]; // list of successful entries (e.g., product names)
  failedRecords: string[]; // list of failed rows or error messages
}

export interface PostResponse {
  statusCode: number;
  message: string;
  errors?: { [key: string]: string }; // optional map of field errors
}
export interface SerialData {
  id: number;
  serialNo: string;
}

const SellerDetailedPage = () => {
  const [activeTab] = useState<"inventory" | "purchases">("inventory");
  const [inventory, setInventory] = useState<any[]>([]);
  const [selecteddataModelNo, setselecteddataModelNo] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [productDetailsMap, setProductDetailsMap] = useState<
    Record<string, ProductDetails>
  >({});
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [serialData, setserialData] = useState<SerialData[]>([]);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null);
  const [inventoryModelValid, setInventoryModelValid] = useState(false);
  const [purchaseModelValid, setPurchaseModelValid] = useState(false);
  const sellerId = Number(localStorage.getItem("seller_id"));
  const [categoryIds] = useState<number | "">("");
  const [modelNoss] = useState<string>("");
  const [warrantys] = useState<number | "">("");
  const [modelnopurchase] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [bulkuploadb, setbulkUploadb] = useState(false);
  const [bulkFileb, setBulkFileb] = useState<File | null>(null);
  const [bulkUploadResultsb, setBulkUploadResultsb] = useState<{
    failedRecords: string[];
    successRecords: string[];
    message?: string;
    statusCode?: number;
  } | null>(null);
  const fileInputRefb = useRef<HTMLInputElement | null>(null);
  const [loader, setloader] = useState(false);
  const [bulkuploadmode, setBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploadResults, setBulkUploadResults] = useState<{
    failedRecords: string[];
    successRecords: string[];
    message?: string;
    statusCode?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate=useNavigate();

  const inventoryForm = useForm();
  const purchaseForm = useForm();

  const fetchInventory = async () => {
    setloader(true);
    const data = await SellerService.fetchInventory(
      sellerId,
      categoryIds,
      modelNoss,
      warrantys
    );
    const reqmodelno = localStorage.getItem("model_noforfetch");
    console.log(reqmodelno, "adarskkksss");
    if (reqmodelno) {
      const filteredData = data.filter(
        (item: any) => item.model_no === reqmodelno
      );
      setselecteddataModelNo(filteredData);
       enrichWithProductDetails(data.map((i: any) => i.model_no)).then(()=>{
      setInventory(filteredData);
    })
    }
  };


  const fetchPurchases = async () => {
    const data = await SellerService.fetchPurchases(sellerId, modelnopurchase);
    setPurchases(data);
    enrichWithProductDetails(data.map((p: any) => p.modelNo));
  };

  const enrichWithProductDetails = async (modelNos: string[]) => {
    const details = await SellerService.getProductDetailsByModelNos(modelNos);
    setProductDetailsMap((prev) => ({ ...prev, ...details }));
    setloader(false);
  };
  const reqmodelno = localStorage.getItem("model_noforfetch");
  console.log(reqmodelno, "adarskkksss yoooooooooooooooo");
  useEffect(() => {
    if (sellerId) {
      fetchInventory();
      fetchPurchases();
    }
  }, [sellerId]);
  console.log(
    selecteddataModelNo,
    "selecteddataModelNoselecteddataModelNoselecteddataModelNo"
  );
  const fetchModelDetails = async (
    batch_no: string,
    formType: "inventory" | "purchase"
  ) => {
    try {
      await companyService
        .fetchSerialByBatch(batch_no)
        .then(async (response) => {
          const modelNoToPass = response?.data?.model_no;
          const realarray = response?.data?.serialMappings;
          setserialData(realarray);
          const prod = await SellerService.getProductByModelNo(modelNoToPass);
          if (!prod || !prod.model_no) {
            // toast("Invalid model number");
            toast("Invalid model number");
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            formType === "inventory"
              ? setInventoryModelValid(false)
              : setPurchaseModelValid(false);
            return;
          }

          if (formType === "inventory") {
            inventoryForm.setValue("price", prod.product_price);
            inventoryForm.setValue("warranty", prod.warrany_tenure);
            inventoryForm.setValue("company_id", prod.company_id);
            inventoryForm.setValue("model_no", prod.model_no);
            inventoryForm.setValue("category_id", prod.product_category);
            inventoryForm.setValue("holderStatus", prod.holderStatus);
            setInventoryModelValid(true);
          } else {
            purchaseForm.setValue("price", prod.product_price);
            purchaseForm.setValue("warranty", prod.warrany_tenure);
            purchaseForm.setValue("modelNo", prod.model_no);
            purchaseForm.setValue("company_id", prod.company_id);
            purchaseForm.setValue("category_id", prod.product_category);
            inventoryForm.setValue("holderStatus", prod.holderStatus);
            setPurchaseModelValid(true);
          }
        });
    } catch (err) {
      console.error(err);
      toast("Error fetching model details");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      formType === "inventory"
        ? setInventoryModelValid(false)
        : setPurchaseModelValid(false);
    }
  };

  const fetchModelDetailsByModelNo = async (
    model_no: string,
    formType: "inventory" | "purchase"
  ) => {
    try {
      const prod = await SellerService.getProductByModelNo(model_no);
      if (!prod || !prod.model_no) {
        // toast("Invalid model number");
        toast("Invalid model number");
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        formType === "inventory"
          ? setInventoryModelValid(false)
          : setPurchaseModelValid(false);
        return;
      }

      console.log(prod, "aaaaaaaaaaaaaaaaaaeeeeeeeeeeeeee");

      if (formType === "inventory") {
        inventoryForm.setValue("price", prod.product_price);
        inventoryForm.setValue("warranty", prod.warrany_tenure);
        inventoryForm.setValue("batch_no,prod", prod.addedbatch_no);
        inventoryForm.setValue("company_id", prod.company_id);
        inventoryForm.setValue("model_no", prod.model_no);
        inventoryForm.setValue("category_id", prod.product_category);
        inventoryForm.setValue("holderStatus", prod.holderStatus);
        setInventoryModelValid(true);
      } else {
        purchaseForm.setValue("price", prod.product_price);
        purchaseForm.setValue("warranty", prod.warrany_tenure);
        purchaseForm.setValue("modelNo", prod.model_no);

        //adarsh here
        //purchaseForm.setValue("batch_number",AddBAtch);
        purchaseForm.setValue("company_id", prod.company_id);
        purchaseForm.setValue("category_id", prod.product_category);
        inventoryForm.setValue("holderStatus", prod.holderStatus);
        setPurchaseModelValid(true);
      }
    } catch (err) {
      console.error(err);
      toast("Error fetching model details");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      formType === "inventory"
        ? setInventoryModelValid(false)
        : setPurchaseModelValid(false);
    }
  };

  const handleInventorySubmit = async (data: any) => {
    if (!inventoryModelValid) {
      toast("Please fetch & validate model number first.");
      return;
    }
    const serial_noToPayload = serialData.map((item) => item.serialNo);
    const Payload = {
      modelNo: data.model_no,
      serialNos: serial_noToPayload,
      itemStatus: 2,
    };
    await SellerService.postItemStatus(Payload).then((response: any) => {
      if (response.statusCode != 200) {
        toast("somethings went wrong");
        return;
      }
    });

    const payload = {
      purchase_date: data.purchase_date,
      price: data.price,
      warranty: data.warranty,
      seller_id: sellerId,
      company_id: data.company_id,
      model_no: data.model_no,
      category_id: data.category_id,
      serial_no: serialData.map((item) => item.serialNo),
    };

    try {
      if (editingItem) {
        await SellerService.editInventory(editingItem.purchase_id, payload);
        setEditingItem(null);
      } else {
        const eligible = await SellerService.checkEligibility(data.model_no, 2);
        if (!eligible) {
          toast(
            "Model number is not eligible for inventory. Please check the model number or contact support."
          );
          return;
        }

        await SellerService.changeHolderStatus(data.model_no, 2).then(
          (response: PostResponse) => {
            if (response.statusCode == 200) {
              SellerService.saveInventory(payload).then(
                (response: PostResponse) => {
                  if (response.statusCode == 200) {
                    toast("Item Added to Inventory");
                    fetchInventory();
                  }
                }
              );
            }
          }
        );
      }

      inventoryForm.reset();
      setShowInventoryForm(false);
      setInventoryModelValid(false);
      fetchInventory();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message);
    }
  };

  const handlePurchaseSubmit = async (data: any) => {
    if (!purchaseModelValid) {
      // toast("Please fetch & validate model number first.");
      toast("Please fetch & validate model number first.");
      return;
    }
    const payload = {
      modelNo: data.modelNo,
      purchase_date: data.purchase_date,
      seller_id: sellerId,
      name: data.name,
      price: data.price,
      warranty: data.warranty,
      phono: data.phono,
      email: data.email,
      serialNo: data.serial_no,
      batchNo: data.batch_number,
    };

    try {
      if (editingPurchase) {
        await SellerService.editPurchase(editingPurchase.sale_id, payload);
        setEditingPurchase(null);
      } else {
        // const eligible = await SellerService.checkEligibility(data.modelNo, 3);
        // if (!eligible) {
        //   toast(
        //     "Model number is not eligible for purchase. Add it to the inventory first."
        //   );
        //   return;
        // }

        // await SellerService.changeHolderStatus(data.modelNo, 3);

        await SellerService.changeHolderStatus(data.modelNo, 3).then(
          (response: PostResponse) => {
            if (response.statusCode == 200) {
              SellerService.savePurchase(payload).then(
                async (response: PostResponse) => {
                  if (response.statusCode == 200) {
                    toast("Item Marked as sold");

                    const Payload = {
                      modelNo: data.model_no,
                      serialNos: [data.serial_no],
                      itemStatus: 3,
                    };

                    await SellerService.postItemStatus(Payload).then(
                      (response: any) => {
                        if (response.statusCode != 200) {
                          toast("somethings went wrong");
                          return;
                        } else {
                          fetchPurchases();
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }

      purchaseForm.reset();
      setShowPurchaseForm(false);
      setPurchaseModelValid(false);
      fetchPurchases();
    } catch (err: any) {
      toast(err.response?.data?.message || err.message);
    }
  };

  // const deleteInventory = async (id: number) => {
  //   await SellerService.deleteInventory(id);
  //   fetchInventory();
  // };

  const deletePurchase = async (id: number) => {
    await SellerService.deletePurchase(id);
    fetchPurchases();
  };

  const showEditOption = (item: any) => {
    setShowPurchaseForm(true);
    purchaseForm.setValue("model_no", item.model_no);
    purchaseForm.setValue("serial_no", item.serial_no);
    fetchModelDetailsByModelNo(item.model_no, "purchase");
  };

  const handleBulkUploadb = () => {
    if (!bulkFileb) {
      toast("Please select a file before uploading.");
      return;
    }
    SellerService.BulkUploadProduct(bulkFileb as File, sellerId)
      .then((response: { data: BulkUploadResponse }) => {
        const { statusCode, message } = response.data;
        setBulkUploadResultsb(response.data);

        if (statusCode === 200) {
          toast(message || "Upload successful");
          fetchInventory();
          if (fileInputRefb.current) {
            fileInputRefb.current.value = "";
            setBulkFileb(null);
          }
        } else if (statusCode === 509) {
          toast(message || "File format issue");
        } else {
          toast(message || "Couldn't upload file");
        }
      })
      .catch((error: unknown) => {
        console.error("Bulk upload failed:", error);
        toast("Please check the console for details.");
      });
  };

  const handleBulkFileChangeb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFileb(file);
  };

  const baseColumnsConfig: Columns = [
    {
      Name: "Model_no",
      columnWidth: 20,
      isRequired: true,
      isList: false,
      comment: "Enter the model number (must exist in inventory)",
    },
    {
      Name: "Price",
      columnWidth: 15,
      isRequired: true,
      isList: false,
      comment: "Enter the product price (numeric)",
    },
    {
      Name: "Purchase_date",
      columnWidth: 20,
      isRequired: true,
      isList: false,
      comment: "Enter the purchase date (YYYY-MM-DD)",
    },
    {
      Name: "Warranty",
      columnWidth: 15,
      isRequired: true,
      isList: false,
      comment: "Enter warranty period in months",
    },
    {
      Name: "Name",
      columnWidth: 25,
      isRequired: false,
      isList: false,
      comment: "Enter the customer's name (optional)",
    },
    {
      Name: "Email",
      columnWidth: 30,
      isRequired: true,
      isList: false,
      comment: "Enter a valid email address",
      showErrorMessage: true,
      error: "Invalid email format",
      errorTitle: "Email Error",
    },
    {
      Name: "Phono",
      columnWidth: 20,
      isRequired: false,
      isList: false,
      comment: "Enter the phone number (optional)",
    },
  ];

  const baseColumnsConfigs: Columns = [
    {
      Name: "Model_no",
      columnWidth: 20,
      isRequired: true,
      isList: false,
      comment: "Enter the model number (must exist in inventory)",
    },
    {
      Name: "Warranty",
      columnWidth: 15,
      isRequired: true,
      isList: false,
      comment: "Enter warranty period in months",
    },
    {
      Name: "Purchase_date",
      columnWidth: 20,
      isRequired: true,
      isList: false,
      comment: "Enter the purchase date in format YYYY-MM-DD (months)",
    },
    {
      Name: "Price",
      columnWidth: 15,
      isRequired: true,
      isList: false,
      comment: "Enter the product price (numeric)",
    },
  ];

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
  };

  const handleBulkUpload = () => {
    if (!bulkFile) {
      toast("Please select a file before uploading.");
      return;
    }

    SellerService.BulkUploadPurchase(bulkFile as File, sellerId)
      .then((response: { data: BulkUploadResponse }) => {
        const { statusCode, message } = response.data;
        setBulkUploadResults(response.data);

        if (statusCode === 200) {
          toast(message || "Upload successful");
          fetchPurchases();
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
            setBulkFile(null);
          }
        } else if (statusCode === 509) {
          toast(message || "File format issue");
        } else {
          toast(message || "Couldn't upload file");
        }
      })
      .catch((error: unknown) => {
        console.error("Bulk upload failed:", error);
        toast("Please check the console for details.");
      });
  };

  return (
    <div className="p-4 md:p-6 mx-auto space-y-6 bg-stone-200 min-h-screen text-gray-900 max-w-7xl">
      
      <h1 className="text-xl md:text-3xl font-bold text-center text-gray-900 mb-6 flex flex-row">
        <button
                onClick={() => navigate(-1)}
                className=" text-black bg-transparent text-lg p-2 rounded-full hover:bg-stone-400 bg-stone-600 transition-colors flex items-center justify-center"
              >
                <ArrowLeft size={15} />
              </button>
        Model No : {reqmodelno}
      </h1>
      <div className="px-6 py-2 bg-white rounded-2xl shadow-md border border-gray-200">
  {inventory[0] && (
    <div className="grid grid-cols-2 gap-6">
      {/* Left section */}
      <div>
        <p className="text-xl font-semibold text-gray-900">Price : ₹{inventory[0].price}</p>
        <p className="text-sm text-gray-500">Warranty : {inventory[0].warranty} months </p>
      </div>

      {/* Right section */}
      <div>
        <p className="text-sm text-gray-600">Purchased Date: <span className="font-medium text-gray-800">{inventory[0].purchase_date}</span></p>
        <p className="text-sm text-gray-600">Batch No: <span className="font-medium text-gray-800">{inventory[0].addedbatch_no}</span></p>
      </div>
    </div>
  )}
</div>
      <Toaster />

      {/* Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === "inventory"
                ? "bg-teal-500 text-white shadow"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-teal-50"
            }`}
          >
            Inventory
          </button>
        </div> */}

        {bulkuploadmode && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <p
                onClick={() => {
                  setBulkUpload(false);
                }}
                className="flex justify-end relative right-0 top-0 bg-white text-black cursor-pointer "
              >
                X
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-row justify-between">
                  <h2 className="text-gray-900 font-semibold">Bulk Upload</h2>
                  {!bulkUploadResults && (
                    <TemplateGenerator
                      columnsConfig={baseColumnsConfig}
                      TemplateName={"SellingTemplate"}
                    />
                  )}
                </div>
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
                    className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
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
                    className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
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
                <div className="flex justify-between"></div>
                {bulkUploadResults && (
                  <div>
                    <h2>Upload Log</h2>

                    <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-teal-50 sticky top-0">
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
                                <td className="px-4 py-2 border-b">{record}</td>
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
                                <td className="px-4 py-2 border-b">{record}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl relative max-w-xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-teal-100 bg-white"
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
              const foundProduct = Object.values(productDetailsMap).find((p) =>
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

      {/* Inventory List */}
      {activeTab === "inventory" && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {inventory?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product Info
                    </th>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th> */}
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory?.map((item) => {
                    const prod = productDetailsMap[item.model_no] || {};
                    const findSerialStatus = (serialNo: string) => {
                      return prod.productSerials?.find(
                        (item) => item.serialNo === serialNo
                      )?.itemsStatus;
                    };

                    const itemStatus = findSerialStatus(item.serial_no);
console.log(itemStatus,"itemStatusitemStatusitemStatusitemStatus");
                    return (
                      <tr key={item.purchase_id}>
                        <td className="px-6 whitespace-nowrap">
                          <div className="flex items-center">
                            {prod.productImages && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img
                                  className="h-10 w-10 object-contain rounded-md"
                                  src={prod.productImages[0]}
                                  alt={prod?.product_name || "Product image"}
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {prod?.product_name || "Unknown Product"}
                              </div>
                              <div className="text-sm text-gray-500">
                                SN: {item.serial_no}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-1 whitespace-nowrap">
                          <span
                            className={`inline-flex text-xs leading-5 font-semibold px-2.5 py-0.5 rounded-full ${
                              itemStatus === 2
                                ? "bg-green-100 text-green-800"
                                : itemStatus === 3
                                ? "bg-red-100 text-red-800"
                                : "bg-teal-100 text-gray-800"
                            }`}
                          >
                            {itemStatus === 2
                              ? "Available"
                              : itemStatus === 3
                              ? "Sold"
                              : itemStatus === 4
                              ? "Customer Registered"
                              : itemStatus === 5
                              ? "Raised Warranty Request"
                              : "Unknown Status"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {/* View Image Button */}
                            {prod.productImages && (
                              <button
                                onClick={() =>
                                  setPreviewImage(prod.productImages[0])
                                }
                                className="text-teal-700 hover:text-blue-800 p-1 rounded bg-teal-100"
                                title="View Image"
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
                            )}

                            {/* Edit Button */}
                            {/* <button
                              onClick={() => {
                                setEditingItem(item);
                                inventoryForm.reset(item);
                                setInventoryModelValid(true);
                                setShowInventoryForm(true);
                              }}
                              className="text-teal-700 hover:text-teal-900 p-1 rounded bg-teal-100"
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

                            {/* Delete Button */}
                            {/* <button
                              onClick={() => deleteInventory(item.purchase_id)}
                              className="text-teal-700 hover:text-red-600 p-1 rounded bg-teal-100"
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
                            </button> */}

                            {/* Mark Sold Button */}
                            <button
                              onClick={() => {
                                showEditOption(item);
                                purchaseForm.setValue(
                                  "batch_number",
                                  item.addedbatch_no
                                );
                              }}
                              className={`text-teal-700 hover:text-green-600 p-1 rounded bg-teal-100 ${itemStatus!== 2 ? "opacity-50 cursor-not-allowed" : ""}`}
                              title="Mark Sold"
                              disabled={itemStatus !== 2}
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8 flex items-center justify-center h-96">
              {loader ? <Loader /> : <div>No items available in inventory</div>}
            </div>
          )}
        </div>
      )}
      {/* Purchases List */}
      {activeTab === "purchases" && (
        <div className="grid grid-cols-4 gap-2">
          {purchases.length > 0 ? (
            purchases.map((purchase) => {
              const prod = productDetailsMap[purchase.modelNo] || {};
              return (
                <div
                  key={purchase.sale_id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Name : {purchase.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Email : {purchase.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone No : {purchase.phono}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700 border-t border-gray-100 pt-2">
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span className="font-medium">{purchase.modelNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span>₹{purchase.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Serial No:</span>
                      <span>{purchase.serialNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{purchase.purchase_date}</span>
                    </div>
                  </div>

                  {prod.product_name && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                      <p className="font-medium">{prod.product_name}</p>
                      <p>Warranty: {prod.warrany_tenure} months</p>
                      <p>Manufactured: {prod.man_date}</p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        prod.holderStatus === 4
                          ? "bg-teal-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {prod.holderStatus === 2
                        ? "Available"
                        : prod.holderStatus === 3
                        ? "Sold"
                        : prod.holderStatus === 4
                        ? "Customer Registered"
                        : prod.holderStatus === 5
                        ? "Raised Warranty Request"
                        : "Unknown Status"}
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingPurchase(purchase);
                          purchaseForm.reset(purchase);
                          setPurchaseModelValid(true);
                          setShowPurchaseForm(true);
                        }}
                        className="text-white  bg-teal-700 p-1.5 rounded flex items-center justify-center"
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
                      </button>
                      <button
                        onClick={() => deletePurchase(purchase.sale_id)}
                        className="text-white bg-teal-700 p-1.5 rounded flex items-center justify-center"
                        title="Cancel"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 col-span-full text-center py-8">
              No purchases found
            </div>
          )}
        </div>
      )}

      {/* Inventory Form Modal */}
      {showInventoryForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 flex-col">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl relative">
            <button
              onClick={() => {
                setShowInventoryForm(false);
                setEditingItem(null);
                inventoryForm.reset();
                setInventoryModelValid(false);
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 text-sm shadow-sm"
              title="Close"
            >
              X
            </button>

            <div className=" p-2  rounded-lg w-full max-w-xl relative">
              <div className="flex flex-row gap-3 justify-between">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  {editingItem ? "Edit Inventory" : "Add Inventory"}
                </h3>
                <div className="flex flex-row gap-2">
                  <button
                    className="bg-teal-500 text-white h-9 flex items-center justify-center"
                    onClick={() => setbulkUploadb(!bulkuploadb)}
                    title="Back"
                  >
                    {bulkuploadb ? "<-" : "Bulk Upload"}
                  </button>
                  {bulkuploadb && (
                    <TemplateGenerator
                      columnsConfig={baseColumnsConfigs}
                      TemplateName={"Add Inventory"}
                    />
                  )}
                </div>
              </div>

              {bulkuploadb ? (
                <div>
                  <div className="flex flex-row justify-end pt-4 pb-4"></div>
                  <div className="flex flex-row gap-3 top-3">
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleBulkFileChangeb}
                      className="w-full border px-4 py-2 rounded-lg"
                      ref={fileInputRefb}
                    />
                    <button
                      onClick={handleBulkUploadb}
                      className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
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
                      className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
                      onClick={() => {
                        setBulkUploadResultsb(null);
                        setBulkFileb(null);
                        if (fileInputRefb.current) {
                          fileInputRefb.current.value = "";
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

                  {bulkUploadResultsb && (
                    <div>
                      <h2 className="flex mx-2 my-2">Upload Log</h2>

                      <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-teal-50 sticky top-0">
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
                            {bulkUploadResultsb.successRecords.map(
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

                            {bulkUploadResultsb.failedRecords.map(
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
              ) : (
                <form
                  onSubmit={inventoryForm.handleSubmit(handleInventorySubmit)}
                  className="space-y-4"
                >
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch No
                      </label>
                      <input
                        {...inventoryForm.register("batch_no")}
                        placeholder="Batch No"
                        //disabled={editingItem}
                        required
                        className="w-full h-8 px-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-black"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model No
                      </label>
                      <input
                        {...inventoryForm.register("model_no")}
                        placeholder="Model No"
                        disabled
                        required
                        className="cursor-not-allowed w-full h-8 px-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-black"
                      />
                    </div>
                    {!editingItem && (
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            fetchModelDetails(
                              inventoryForm.getValues("batch_no"),
                              "inventory"
                            )
                          }
                          className="bg-teal-500 flex items-center justify-center hover:bg-teal-700 text-white h-8 px-2 rounded-md text-sm"
                        >
                          Fetch
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        {...inventoryForm.register("price")}
                        type="number"
                        disabled
                        required
                        className="w-full cursor-not-allowed h-8 px-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warranty (Months)
                      </label>
                      <input
                        {...inventoryForm.register("warranty")}
                        type="number"
                        disabled
                        required
                        className="cursor-not-allowed w-full h-8 px-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date
                    </label>
                    <input
                      {...inventoryForm.register("purchase_date")}
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      required
                      className="w-full h-8 px-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-teal-200 text-black"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inventoryModelValid}
                    className={`w-full py-2 rounded-md text-white text-sm font-medium transition ${
                      inventoryModelValid
                        ? "bg-teal-500 hover:bg-teal-700"
                        : "bg-teal-400 cursor-not-allowed"
                    }`}
                  >
                    {editingItem ? "Update Item" : "Add to Inventory"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Purchase Form Modal */}
      {showPurchaseForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setShowPurchaseForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-white"
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
            <h3 className="text-lg font-semibold mb-4">
              {editingPurchase ? "Edit Sale" : "Mark Item Sold"}
            </h3>
            <form
              onSubmit={purchaseForm.handleSubmit(handlePurchaseSubmit)}
              className="space-y-4"
            >
              <div className="flex flex-row gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model No
                  </label>
                  <input
                    {...purchaseForm.register("modelNo")}
                    placeholder="Model No"
                    required
                    disabled
                    className="w-full px-2 h-8 border border-gray-300 rounded-md bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial No
                  </label>
                  <input
                    {...purchaseForm.register("serial_no")}
                    placeholder="Serial No"
                    required
                    disabled
                    className="w-full px-2 h-8 border border-gray-300 rounded-md bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    {...purchaseForm.register("price")}
                    type="number"
                    required
                    disabled
                    className="w-full px-2 h-8 border border-gray-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty
                  </label>
                  <input
                    {...purchaseForm.register("warranty")}
                    type="number"
                    required
                    disabled
                    className="w-full px-2 h-8 border border-gray-300 rounded-md bg-white text-black"
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch No
                  </label>
                  <input
                    {...purchaseForm.register("batch_number")}
                    placeholder="Model No"
                    required
                    disabled
                    className="w-full px-2 h-8 border border-gray-300 rounded-md bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Date<span className="text-red-500">*</span>
                  </label>
                  <input
                    {...purchaseForm.register("purchase_date")}
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-2 h-8 border bg-gray-300 text-black border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name<span className="text-red-500">*</span>
                </label>
                <input
                  {...purchaseForm.register("name")}
                  placeholder="Name"
                  required
                  className="w-full px-2 h-8 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    {...purchaseForm.register("email")}
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full px-2 h-8 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone<span className="text-red-500">*</span>
                  </label>
                  <input
                    {...purchaseForm.register("phono")}
                    type="number"
                    placeholder="Phone"
                    required
                    className="w-full px-2 h-8 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!purchaseModelValid}
                className={`w-full px-2 h-8 rounded-md text-white text-sm font-medium transition flex items-center justify-center ${
                  purchaseModelValid
                    ? "bg-teal-500 hover:bg-teal-700"
                    : "bg-teal-400 cursor-not-allowed"
                }`}
              >
                {editingPurchase ? "Update Sale" : "Mark as Sold"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDetailedPage;
