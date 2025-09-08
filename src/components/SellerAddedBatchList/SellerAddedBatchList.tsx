import React, { useEffect, useState } from "react";
import SellerService from "../../services/SellerService";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SellerAddedBatchList = () => {
  const sellerId = Number(localStorage.getItem("seller_id"));
  const [batchNos, setBatchNos] = useState<string[]>([]);
const navigate=useNavigate();
  const fetchInventory = async () => {
    try {
      const response = await SellerService.fetchInventory(
        sellerId,
        "",
        "",
        ""
      );

      const batchNos: string[] = Array.from(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Set(response.map((item: any) => String(item.addedbatch_no)))
      );
      setBatchNos(batchNos);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="min-h-screen w-full bg-stone-100 py-6 px-4">
      {/* Page header */}
      <div className="w-full flex justify-center">
        <h1 className="text-gray-700 text-3xl font-bold tracking-wide flex flex-row">
             <button
                onClick={() => navigate(-1)}
                className=" text-black bg-transparent text-lg p-2 rounded-full hover:bg-stone-400 bg-stone-600 transition-colors flex items-center justify-center"
              >
                <ArrowLeft size={15} />
              </button>
          Acknowledged Batches
        </h1>

      </div>

      {/* Batch list container */}
      <div className="mt-8 max-w-4xl mx-auto">
        {batchNos.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            No batches acknowledged yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {batchNos.map((batch, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-xl p-4 flex items-center justify-center text-lg font-medium text-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Batch #{batch}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerAddedBatchList;
