import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

type SerialMapping = {
  map_id: number;
  serialNo: string;
  is_sold: number;
};

type BatchDetails = {
  batch_id: number;
  model_no: string;
  batch_no: string;
  createdDate: string;
  serialMappings: SerialMapping[];
};

const BatchDetailsPage = () => {
  const { batchId } = useParams();
  const [batch, setBatch] = useState<BatchDetails>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  console.log(batchId,"batchId")
  useEffect(() => {
  const fetchBatchDetails = async () => {
    try {
    await axios.get<BatchDetails>(
        `http://localhost:1089/api/batch/batchId`,
        {
          params: { batchId }, 
        }
      ).then((res)=>{
      setBatch(res.data);
      })
    } catch (err) {
      console.error("Error fetching batch details", err);
      setError("Failed to load batch details");
    } finally {
      setLoading(false);
    }
  };

  fetchBatchDetails();
}, [batchId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );

  if (!batch) return <p>No data found</p>;
console.log(batch,"huhuhuhuhuh")
  return (
    <div className="container mx-auto px-5 py-7 min-h-screen bg-gray-100">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-white mb-4 hover:underline"
      >
        <ArrowLeft className="w-3 h-3 mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Batch Number - {batch.batch_no}
      </h1>

      <div className="bg-white rounded shadow p-4 mb-6 text-black">
        <p>
          <strong>Model No:</strong> {batch.model_no}
        </p>
        <p>
          <strong>Created Date:</strong>{" "}
          {new Date(batch.createdDate).toLocaleString()}
        </p>
      </div>

      {/* Serial Mappings Table */}
      <div className="overflow-x-auto rounded-md border border-gray-300 bg-white shadow">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200 text-gray-700 text-left">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Sl. No</th>
              <th className="border border-gray-300 px-4 py-2">Serial No</th>
              <th className="border border-gray-300 px-4 py-2">Batch Status</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {batch.serialMappings.length ? (
              batch.serialMappings.map((s, index) => (
                <tr
                  key={s.map_id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {s.serialNo}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {s.is_sold === 1 ? "With Customer" : "With Seller"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center px-4 py-6 text-gray-600"
                >
                  No serial numbers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchDetailsPage;
