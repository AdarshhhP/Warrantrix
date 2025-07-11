



/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import SellerService from "../../services/SellerService";

const Seller = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "purchases">("inventory");
  const [inventory, setInventory] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [productDetailsMap, setProductDetailsMap] = useState<Record<string, any>>({});
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null);
  const [inventoryModelValid, setInventoryModelValid] = useState(false);
  const [purchaseModelValid, setPurchaseModelValid] = useState(false);
  const sellerId = Number(localStorage.getItem("seller_id"));
  const [categoryIds, setCategoryIds] = useState<number | "">("");
  const [modelNoss, setModelNos] = useState<string>("");
  const [warrantys, setWarrantys] = useState<number | "">("");
  const [modelnopurchase, setModelNoPurchase] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const inventoryForm = useForm();
  const purchaseForm = useForm();

  const fetchInventory = async () => {
    const data = await SellerService.fetchInventory(sellerId, categoryIds, modelNoss, warrantys);
    setInventory(data);
    enrichWithProductDetails(data.map((i: any) => i.model_no));
  };

  const fetchPurchases = async () => {
    const data = await SellerService.fetchPurchases(sellerId, modelnopurchase);
    setPurchases(data);
    enrichWithProductDetails(data.map((p: any) => p.modelNo));
  };

  const enrichWithProductDetails = async (modelNos: string[]) => {
    const map = await SellerService.getProductDetailsByModelNos(modelNos);
    setProductDetailsMap((prev) => ({ ...prev, ...map }));
  };

  useEffect(() => {
    if (sellerId) {
      fetchInventory();
      fetchPurchases();
    }
  }, [sellerId]);

  const fetchModelDetails = async (modelNo: string, formType: "inventory" | "purchase") => {
    try {
      const prod = await SellerService.getProductByModelNo(modelNo);
      if (!prod || !prod.model_no) {
        alert("Invalid model number");
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
    } catch (err) {
      console.error(err);
      alert("Error fetching model details");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      formType === "inventory"
        ? setInventoryModelValid(false)
        : setPurchaseModelValid(false);
    }
  };

  const handleInventorySubmit = async (data: any) => {
    if (!inventoryModelValid) {
      alert("Please fetch & validate model number first.");
      return;
    }

    const payload = {
      purchase_date: data.purchase_date,
      price: data.price,
      warranty: data.warranty,
      seller_id: sellerId,
      company_id: data.company_id,
      model_no: data.model_no,
      category_id: data.category_id,
    };

    try {
      if (editingItem) {
        await SellerService.editInventory(editingItem.purchase_id, payload);
        setEditingItem(null);
      } else {
        const eligible = await SellerService.checkEligibility(data.model_no, 2);
        if (!eligible) {
          alert("Model number is not eligible for inventory. Please check the model number or contact support.");
          return;
        }

        await SellerService.saveInventory(payload);
        await SellerService.changeHolderStatus(data.model_no, 2);
      }

      inventoryForm.reset();
      setShowInventoryForm(false);
      setInventoryModelValid(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handlePurchaseSubmit = async (data: any) => {
    if (!purchaseModelValid) {
      alert("Please fetch & validate model number first.");
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
    };

    try {
      if (editingPurchase) {
        await SellerService.editPurchase(editingPurchase.sale_id, payload);
        setEditingPurchase(null);
      } else {
        const eligible = await SellerService.checkEligibility(data.modelNo, 3);
        if (!eligible) {
          alert("Model number is not eligible for purchase. Add it to the inventory first.");
          return;
        }

        await SellerService.savePurchase(payload);
        await SellerService.changeHolderStatus(data.modelNo, 3);
      }

      purchaseForm.reset();
      setShowPurchaseForm(false);
      setPurchaseModelValid(false);
      fetchPurchases();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteInventory = async (id: number) => {
    await SellerService.deleteInventory(id);
    fetchInventory();
  };

  const deletePurchase = async (id: number) => {
    await SellerService.deletePurchase(id);
    fetchPurchases();
  };

  const showEditOption = (item: any) => {
    setShowPurchaseForm(true);
    purchaseForm.setValue("modelNo", item.model_no);
    fetchModelDetails(item.model_no, "purchase");
  };

  // ... your JSX return block remains the same ...

  return (
    <div className="p-6 min-w-sc mx-auto space-y-6 bg-white h-fit text-gray-900">
  <h1 className="text-4xl font-bold text-center text-gray-900">Seller Dashboard</h1>

  {/* Tabs */}
  <div className="flex justify-between items-center mb-6">
    <div className="space-x-4">
      <button
        onClick={() => setActiveTab("inventory")}
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "inventory"
            ? "bg-gray-900 text-white shadow"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        Inventory
      </button>
      <button
        onClick={() => setActiveTab("purchases")}
        className={`px-5 py-2 rounded-full font-medium transition ${
          activeTab === "purchases"
            ? "bg-gray-900 text-white shadow"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        Sold Items
      </button>
    </div>

    {/* Filters and Add Buttons */}
    <div>
      <span>
        {activeTab === "inventory" ? (
          <div className="flex justify-between items-center">
            <span className="flex flex-wrap items-center gap-2 text-sm">
              <input
                type="text"
                placeholder="Model No"
                className="p-1.5 border border-gray-300 rounded-md w-36"
                value={modelNoss}
                onChange={(e) => setModelNos(e.target.value)}
              />
              <input
                type="number"
                min={0}
                placeholder="Warranty"
                className="p-1.5 border border-gray-300 rounded-md w-28"
                value={warrantys || ""}
                onChange={(e) =>
                  setWarrantys(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
              <select
                onChange={(e) =>
                  setCategoryIds(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                value={categoryIds || ""}
                className="p-1.5 border border-gray-300 rounded-md w-36"
              >
                <option value="">Select Category</option>
                <option value="1">Electronics</option>
                <option value="2">Plastic</option>
                <option value="3">Wood</option>
                <option value="4">Metal</option>
              </select>
              <button
                onClick={fetchInventory}
                className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md shadow-sm text-sm"
              >
                Search
              </button>
            </span>

            <button
              onClick={() => {
                setEditingItem(null);
                inventoryForm.reset();
                setInventoryModelValid(false);
                setShowInventoryForm(true);
              }}
              className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-full shadow ml-2"
            >
              + Add Item
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center gap-2">
            <input
              type="text"
              placeholder="Model No"
              className="p-1.5 border border-gray-300 rounded-md w-36"
              value={modelnopurchase}
              onChange={(e) => setModelNoPurchase(e.target.value)}
            />
            <button
              onClick={fetchPurchases}
              className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md shadow-sm text-sm"
            >
              Search
            </button>
            {/* <button
              onClick={() => {
                setEditingPurchase(null);
                purchaseForm.reset();
                setPurchaseModelValid(false);
                setShowPurchaseForm(true);
              }}
              className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-full shadow"
            >
              + Mark Item Sold
            </button> */}
          </div>
        )}
      </span>
    </div>
  </div>

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

  {/* Inventory List */}
{activeTab === "inventory" && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {inventory.length > 0 ? (
      inventory.map((item) => {
        const prod = productDetailsMap[item.model_no] || {};
        return (
          <div
            key={item.purchase_id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-md"
          >
            <span className="flex justify-between">
              <p className="font-semibold text-lg mb-1">
                Model: {item.model_no}
              </p>
              <p
                className="text-gray-700 underline cursor-pointer"
                onClick={() => showEditOption(item)}
              >
                Mark sold!
              </p>
            </span>
            <div className="flex items-center justify-between mb-2">
            <p>Price: ₹{item.price}</p>
             <button
                onClick={() => setPreviewImage(productDetailsMap[item.model_no]?.product_image || null)}
                className="text-blue-600 underline text-sm hover:text-blue-800 transition"
              >
                View Image
              </button>
              </div>
            <p>Warranty: {item.warranty} months</p>
            <div className="flex justify-between items-center mt-2 text-sm">
              <p>Date: {item.purchase_date}</p>
              <p className="text-right font-medium text-gray-700">
                Item Status:{" "}
                {prod.holderStatus === 2
                  ? "Item Available"
                  : prod.holderStatus === 3
                  ? "Sold Out"
                  : prod.holderStatus === 4
                  ? "Item Purchased"
                  : prod.holderStatus === 1
                  ? "Product Shipped"
                  : prod.holderStatus === 5
                  ? "Warranty Requested"
                  : "No Data"}
              </p>
            </div>
            {prod.product_name && (
              <>
                <hr className="my-3" />
                <p>Product Name: {prod.product_name}</p>
                <p>Warranty Tenure (month): {prod.warrany_tenure}</p>
                <p>Manufactured: {prod.man_date}</p>
              </>
            )}
            <div className="space-x-4 mt-4 text-sm font-medium">
              <button
                onClick={() => {
                  setEditingItem(item);
                  inventoryForm.reset(item);
                  setInventoryModelValid(true);
                  setShowInventoryForm(true);
                }}
                className="text-gray-700 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteInventory(item.purchase_id)}
                className="text-gray-700 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <div className="text-gray-500 col-span-full text-center">
        No items available
      </div>
    )}
  </div>
)}


  {/* Purchases List */}
 {activeTab === "purchases" && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {purchases.length > 0 ? (
      purchases.map((purchase) => {
        const prod = productDetailsMap[purchase.modelNo] || {};
        return (
          <div
            key={purchase.sale_id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-md"
          >
            <p className="font-semibold text-lg mb-1">
              Customer: {purchase.name}
            </p>
            <p>Model: {purchase.modelNo}</p>
            <p>Price: ₹{purchase.price}</p>
            <p>Date: {purchase.purchase_date}</p>

            {prod.product_name && (
              <>
                <hr className="my-3" />
                <p>Product Name: {prod.product_name}</p>
                <p>Warranty Years: {prod.warrany_tenure}</p>
                <p>Manufactured: {prod.man_date}</p>
                <p>
                  Item Status:{" "}
                  <span className="text-gray-700 font-medium">
                    {prod.holderStatus === 4
                      ? "Apply for warranty"
                      : "Requested for warranty"}
                  </span>
                </p>
              </>
            )}

            <div className="space-x-4 mt-4 text-sm font-medium">
              <button
                onClick={() => {
                  setEditingPurchase(purchase);
                  purchaseForm.reset(purchase);
                  setPurchaseModelValid(true);
                  setShowPurchaseForm(true);
                }}
                className="text-gray-700 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deletePurchase(purchase.sale_id)}
                className="text-gray-700 hover:underline"
              >
                Cancel Request
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <div className="text-gray-500 col-span-full text-center">
        No purchases found.
      </div>
    )}
  </div>
)}


  {/* Inventory Form */}
  {showInventoryForm && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl relative">
        <button
          onClick={() => setShowInventoryForm(false)}
          className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4">
          {editingItem ? "Edit Inventory" : "Add Inventory"}
        </h3>
        <form
          onSubmit={inventoryForm.handleSubmit(handleInventorySubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2 flex gap-2">
            <input
              {...inventoryForm.register("model_no")}
              placeholder="Model No"
              required
              className="p-2 border rounded w-full"
            />

            {
              !editingItem&&(
            <button
              type="button"
              onClick={() =>
                fetchModelDetails(
                  inventoryForm.getValues("model_no"),
                  "inventory"
                )
              }
              className="bg-gray-900 text-white px-4 py-1 rounded"
            >
              Fetch
            </button>
              )
            }
           


          </div>
          <div>
            <label className="block mb-1">Price</label>
            <input
              {...inventoryForm.register("price")}
              type="number"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Warranty (Months)</label>
            <input
              {...inventoryForm.register("warranty")}
              type="number"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Purchase Date</label>
            <input
              {...inventoryForm.register("purchase_date")}
              type="date"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={!inventoryModelValid}
              className={`w-full py-2 rounded transition ${
                inventoryModelValid
                  ? "bg-gray-900 hover:bg-gray-700 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* Purchase Form */}
  {showPurchaseForm && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl relative">
        <button
          onClick={() => setShowPurchaseForm(false)}
          className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4">
          {editingPurchase ? "Edit Purchase" : "Mark Item Sold"}
        </h3>
        <form
          onSubmit={purchaseForm.handleSubmit(handlePurchaseSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2 flex gap-2">
            <input
              {...purchaseForm.register("modelNo")}
              placeholder="Model No"
              required
              className="p-2 border rounded w-full"
              disabled
            />
            {/* <button
              type="button"
              onClick={() =>
                fetchModelDetails(
                  purchaseForm.getValues("modelNo"),
                  "purchase"
                )
              }
              className="bg-gray-900 text-white px-4 py-1 rounded"
            >
              Fetch
            </button> */}
          </div>
          
          <div>
            <label className="block mb-1">Price</label>
            <input
              {...purchaseForm.register("price")}
              type="number"
              required
              className="p-2 border rounded w-full"
              disabled
            />
          </div>
          <div>
            <label className="block mb-1">Warranty</label>
            <input
              {...purchaseForm.register("warranty")}
              type="number"
              required
              className="p-2 border rounded w-full"
              disabled
            />
          </div>
          <div>
            <label className="block mb-1">Selling Date</label>
            <input
              {...purchaseForm.register("purchase_date")}
              type="date"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Name</label>
            <input
              {...purchaseForm.register("name")}
              placeholder="Customer Name"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              {...purchaseForm.register("email")}
              placeholder="Email"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Phone</label>
            <input
              {...purchaseForm.register("phono")}
              type="number"
              placeholder="Phone"
              required
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={!purchaseModelValid}
              className={`w-full py-2 rounded transition ${
                purchaseModelValid
                  ? "bg-gray-900 hover:bg-gray-700 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

  );
};

export default Seller;

