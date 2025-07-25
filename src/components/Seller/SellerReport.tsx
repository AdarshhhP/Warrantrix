/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import SellerService from "../../services/SellerService";

const SellerReport = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "purchases">("inventory");
  const [inventory, setInventory] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [productDetailsMap, setProductDetailsMap] = useState<Record<string, any>>({});
  const sellerId = Number(localStorage.getItem("seller_id"));

  const [categoryIds, setCategoryIds] = useState<number | "">("");
  const [modelNoss, setModelNos] = useState<string>("");
  const [warrantys, setWarrantys] = useState<number | "">("");
  const [modelnopurchase, setModelNoPurchase] = useState<string>("");

  const [inventoryPage, setInventoryPage] = useState(0);
  const [inventorySize, setInventorySize] = useState(5);
  const [inventoryTotalPages, setInventoryTotalPages] = useState(1);

  const [purchasePage, setPurchasePage] = useState(0);
  const [purchaseSize, setPurchaseSize] = useState(5);
  const [purchaseTotalPages, setPurchaseTotalPages] = useState(1);

  const fetchInventory = async () => {
    try {
      const data = await SellerService.getInventory({
        Seller_Id: sellerId,
        categoryId: categoryIds,
        modelNo: modelNoss,
        warranty: warrantys === 0 ? "" : warrantys,
        page: inventoryPage,
        size: inventorySize,
      });
      setInventory(data.content || []);
      setInventoryTotalPages(data.totalPages || 1);
      enrichWithProductDetails(data.content.map((i: any) => i.model_no));
    } catch (err) {
      console.error("Inventory fetch error", err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const data = await SellerService.getPurchases({
        Seller_Id: sellerId,
        modelNo: modelnopurchase,
        page: purchasePage,
        size: purchaseSize,
      });
      setPurchases(data.content || []);
      setPurchaseTotalPages(data.totalPages || 1);
      enrichWithProductDetails(data.content.map((p: any) => p.modelNo));
    } catch (err) {
      console.error("Purchases fetch error", err);
    }
  };

  const enrichWithProductDetails = async (modelNos: string[]) => {
    try {
      const map = await SellerService.getProductDetails(modelNos);
      setProductDetailsMap((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.error("Product enrichment error", err);
    }
  };

  useEffect(() => {
    if (sellerId) fetchInventory();
  }, [sellerId, inventoryPage, inventorySize]);

  useEffect(() => {
    if (sellerId) fetchPurchases();
  }, [sellerId, purchasePage, purchaseSize]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>, type: "inventory" | "purchases") => {
    const value = Number(e.target.value);
    if (type === "inventory") {
      setInventorySize(value);
      setInventoryPage(0); // Reset to first page when changing size
    } else {
      setPurchaseSize(value);
      setPurchasePage(0); // Reset to first page when changing size
    }
  };

  const handleDownload = () => {
    const data = activeTab === "inventory" ? inventory : purchases;
    if (!data || data.length === 0) {
      alert("No data available to download");
      return;
    }

    const keyLabelMap: Record<string, string> = {
      sale_id: "Sale ID",
      purchase_id: "Purchase ID",
      model_no: "Model No",
      modelNo: "Model No",
      name: "Customer Name",
      email: "Email",
      phono: "Phone",
      price: "Price (₹)",
      warranty: "Warranty (months)",
      warrany_tenure: "Warranty (years)",
      purchase_date: "Purchase Date",
      man_date: "Manufacture Date",
      seller_id: "Seller ID",
      customer_email: "Customer Email",
      phone_number: "Phone",
      customer_name: "Customer Name",
      request_date: "Request Date",
      warranty_status: "Status",
    };

    const excludedKeys = ["is_deleted", "image", "product_image"];
    const filteredKeys = Object.keys(data[0]).filter((key) => !excludedKeys.includes(key));

    const formattedData = data.map((row) => {
      const newRow: Record<string, any> = {};
      filteredKeys.forEach((key) => {
        const label = keyLabelMap[key] || key;
        newRow[label] = row[key];
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    worksheet["!cols"] = filteredKeys.map((key) => {
      const maxLength = Math.max(
        keyLabelMap[key]?.length || key.length,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: maxLength + 4 };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `report_${activeTab}.xlsx`);
  };

  return (
    <div className="p-6 min-w-sc mx-auto space-y-6 bg-white h-full text-gray-900">
      <div className="w-full flex justify-between">
        <h1 className="text-4xl font-bold text-center text-gray-900 flex flex-row">
          Reports
          
        </h1>
         <button
          onClick={handleDownload}
          className="flex h-8 items-center bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-800 transition"
        >
          Download
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="space-x-4 flex flex-row">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-5 py-2 h-8 flex items-center justify-center rounded-full font-medium transition ${
              activeTab === "inventory"
                ? "bg-blue-600 text-white shadow"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-blue-100"
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-5 h-8 py-2 flex items-center justify-center rounded-full font-medium transition ${
              activeTab === "purchases"
                ? "bg-blue-600 text-white shadow"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-blue-100"
            }`}
          >
            Sold Items
          </button>
        </div>

        <div>
          {activeTab === "inventory" ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <input
                type="text"
                placeholder="Model No"
                className="p-1.5 border border-gray-300 rounded-md w-36 bg-white text-black"
                value={modelNoss}
                onChange={(e) => setModelNos(e.target.value)}
              />
              <input
                type="number"
                min={0}
                placeholder="Warranty"
                className="p-1.5 border border-gray-300 rounded-md w-28 bg-white text-black"
                value={warrantys || ""}
                onChange={(e) =>
                  setWarrantys(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
              <select
                onChange={(e) =>
                  setCategoryIds(e.target.value === "" ? "" : Number(e.target.value))
                }
                value={categoryIds || ""}
                className="p-1.5 border border-gray-300 rounded-md w-36 bg-white text-black"
              >
                <option value="">Select Category</option>
                <option value="1">Electronics</option>
                <option value="2">Plastic</option>
                <option value="3">Wood</option>
                <option value="4">Metal</option>
              </select>
              <button
                onClick={() => {setInventoryPage(0);fetchInventory();fetchPurchases()}}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md shadow-sm text-sm"
              >
                Search
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2">
              <input
                type="text"
                placeholder="Model No"
                className="p-1.5 border border-gray-300 rounded-md w-36 h-8 bg-white text-black"
                value={modelnopurchase}
                onChange={(e) => setModelNoPurchase(e.target.value)}
              />
              <button
                onClick={() => setPurchasePage(0)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md shadow-sm text-sm"
              >
                Search
              </button>
            </div>
          )}
        </div>
      </div>

     {activeTab === "inventory" && (
  <div className="border border-gray-300 shadow-sm flex flex-col justify-between" style={{ height: '280px' }}>
    <div className="overflow-auto flex-1">
      <table className="min-w-full table-auto text-sm text-left text-gray-800">
        <thead className="bg-blue-100 text-gray-900 sticky top-0">
          <tr>
            <th className="p-2 border">Sl No</th>
            <th className="p-2 border">Model No</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Warranty (months)</th>
            <th className="p-2 border">Purchase Date</th>
            <th className="p-2 border">Product Name</th>
            <th className="p-2 border">Tenure (years)</th>
            <th className="p-2 border">Mfg Date</th>
            <th className="p-2 border">Item Status</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item, index) => {
            const prod = productDetailsMap[item.model_no] || {};
            return (
              <tr key={index + 1} className="text-center hover:bg-blue-50">
                <td className="p-2 border">{inventoryPage * inventorySize + index + 1}</td>
                <td className="p-2 border">{item.model_no}</td>
                <td className="p-2 border">₹{item.price}</td>
                <td className="p-2 border">{item.warranty}</td>
                <td className="p-2 border">{item.purchase_date}</td>
                <td className="p-2 border">{prod.product_name || "-"}</td>
                <td className="p-2 border">{prod.warrany_tenure || "-"}</td>
                <td className="p-2 border">{prod.man_date || "-"}</td>
                <td className="p-2 border">
                  {prod.holderStatus === 2
                    ? "Item Available"
                    : prod.holderStatus === 3
                    ? "Item Sold"
                    : prod.holderStatus === 4
                    ? "With Customer"
                    : prod.holderStatus === 1
                    ? "Product Shipped"
                    : prod.holderStatus === 5
                    ? "Warranty Requested"
                    : "No Data"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="sticky bottom-0 bg-white border-t border-gray-200 py-2 px-4">
      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() => setInventoryPage((prev) => Math.max(prev - 1, 0))}
          disabled={inventoryPage === 0}
          className="px-4 py-1.5 rounded bg-blue-200 text-gray-700 hover:bg-blue-300 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-1.5">{`Page ${inventoryPage+1} of ${inventoryTotalPages}`}</span>
        <button
          onClick={() =>
            setInventoryPage((prev) => Math.min(prev + 1, inventoryTotalPages - 1))
          }
          disabled={inventoryPage >= inventoryTotalPages - 1}
          className="px-4 py-1.5 rounded bg-blue-200 text-gray-700 hover:bg-blue-300 disabled:opacity-50"
        >
          Next
        </button>
        <div className="flex items-center gap-2 ml-4">
          <select
            className="bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500"
            onChange={(e) => handlePageSizeChange(e, "inventory")}
            value={inventorySize}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm">per page</span>
        </div>
      </div>
    </div>
  </div>
)}

{activeTab === "purchases" && (
  <div className="border border-gray-300 shadow-sm flex flex-col justify-between" style={{ height: '280px' }}>
    <div className="overflow-auto flex-1">
      <table className="min-w-full table-auto text-sm text-left text-gray-800">
        <thead className="bg-blue-100 text-gray-900 sticky top-0">
          <tr>
            <th className="p-2 border">Sl.No</th>
            <th className="p-2 border">Model No</th>
            <th className="p-2 border">Customer Name</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Purchase Date</th>
            <th className="p-2 border">Product Name</th>
            <th className="p-2 border">Warranty Years</th>
            <th className="p-2 border">Mfg Date</th>
            <th className="p-2 border">Item Status</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase, index) => {
            const prod = productDetailsMap[purchase.modelNo] || {};
            return (
              <tr key={purchase.sale_id} className="text-center hover:bg-blue-50">
                <td className="p-2 border">{purchasePage * purchaseSize + index + 1}</td>
                <td className="p-2 border">{purchase.modelNo}</td>
                <td className="p-2 border">{purchase.name}</td>
                <td className="p-2 border">₹{purchase.price}</td>
                <td className="p-2 border">{purchase.purchase_date}</td>
                <td className="p-2 border">{prod.product_name || "-"}</td>
                <td className="p-2 border">{prod.warrany_tenure || "-"}</td>
                <td className="p-2 border">{prod.man_date || "-"}</td>
                <td className="p-2 border text-gray-700 font-medium">
                  {prod.holderStatus === 4
                    ? "With Customer"
                    : "Requested for warranty"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="sticky bottom-0 bg-white border-t border-gray-200 py-2 px-4">
      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() => setPurchasePage((prev) => Math.max(prev - 1, 0))}
          disabled={purchasePage === 0}
          className="px-4 py-1.5 rounded bg-blue-200 text-gray-700 hover:bg-blue-300 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-1.5">{`Page ${purchasePage+1} of ${purchaseTotalPages}`}</span>
        <button
          onClick={() =>
            setPurchasePage((prev) => Math.min(prev + 1, purchaseTotalPages - 1))
          }
          disabled={purchasePage >= purchaseTotalPages - 1}
          className="px-4 py-1.5 rounded bg-blue-200 text-gray-700 hover:bg-blue-300 disabled:opacity-50"
        >
          Next
        </button>
        <div className="flex items-center gap-2 ml-4">
          <select
            className="bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500"
            onChange={(e) => handlePageSizeChange(e, "purchases")}
            value={purchaseSize}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm">per page</span>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default SellerReport;