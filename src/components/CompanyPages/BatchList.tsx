import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Eye } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import axios from "axios";

type BatchResponse = {
  batch_id: number;
  modelNo: string;
  batchNo: string;
  createdDate: string | null;
  serialNo: string[];
  message?: string | null;
  statusCode?: string | null;
};

type PagedResponse<T> = {
  content: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageable: any; // can refine later if needed
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};


const BatchListPage = () => {
  const [batches, setBatches] = useState<BatchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestPage, setRequestPage] = useState(0);
  const [requestSize,setrequestSize] = useState(5);
    const [totalRequestPages,setTotalRequestPages] = useState(1);
    
  
  const navigate = useNavigate();

  // Fetch batches
 const fetchBatches = async () => {
  try {
    const response = await axios.get<PagedResponse<BatchResponse>>(
      `http://localhost:1089/api/batch/list?page=${requestPage}&size=${requestSize}`
    );

    setBatches(response.data.content); // ✅ actual list
    setTotalRequestPages(response.data.totalPages); // ✅ pagination info

    console.log(response.data, "adarsh");
  } catch (err) {
    console.error("Failed to fetch batches", err);
    setError("Failed to load batches");
  } finally {
    setIsLoading(false);
  }
};


    const PageSizeChange = (e: string) => {
    setrequestSize(Number(e));
  };

  useEffect(() => {
    fetchBatches();
  }, [requestPage]);

  // API call to add serial number
  const handleAddSerial = async (batchNo: string, serial: string) => {
    if (!serial.trim()) return;
    try {
      await axios.post("http://localhost:1089/api/batch/add-serials", {
        batchNo: batchNo,
        serialNumbers: [serial],
      });

      toast.success("Serial number added successfully");

      setBatches((prev) =>
        prev.map((batch) =>
          batch.batchNo === batchNo
            ? { ...batch, serialNo: [...batch.serialNo, serial] }
            : batch
        )
      );
    } catch (err) {
      console.error("Error adding serial number", err);
      toast.error("Failed to add serial number");
    }
  };

  // Table columns
  const columns: ColumnDef<BatchResponse>[] = [
    {
      id: "slno",
      header: "Sl. No",
      cell: ({ row }) => requestPage * requestSize + row.index + 1,

    },
    {
      accessorKey: "batchNo",
      header: "Batch Number",
    },
    {
      accessorKey: "createdDate",
      header: "Created Date",
      cell: ({ row }) => {
        const { createdDate } = row.original;
        if (!createdDate) return "N/A";
        const date = new Date(createdDate);
        return date.toLocaleString(); // ✅ formatted
      },
    },
    {
      accessorKey: "modelNo",
      header: "Model Number",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const batch = row.original;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [serialInput, setSerialInput] = useState("");

        const handleSubmit = () => {
          handleAddSerial(batch.batchNo, serialInput);
          setSerialInput("");
        };
        return (
          <div className="flex gap-3 items-center">
            {/* 👁️ View button */}
            <button
              onClick={() => navigate(`/manage-batches/${batch.batch_id}`)}
              className="bg-white text-white-600 hover:text-blue-600"
              title="View Batch Items"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* ➕ Add serial */}
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button
                  className="text-green-600 hover:text-green-800"
                  title="Add Item"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title className="text-black font-bold">
                      Add Item
                    </Dialog.Title>
                    <Dialog.Close>
                      <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </Dialog.Close>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter serial number"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: batches,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading)
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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-100">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Batch List</h1>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-300 bg-white shadow h-[355px] flex justify-between flex-col">
        <div>
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200 text-gray-700 text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border border-gray-300 px-4 py-2 text-sm font-semibold"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border border-gray-300 px-4 py-2 text-sm text-gray-800 align-top"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center px-4 py-6 text-gray-600"
                >
                  No batches found.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>

          <div className="flex justify-center items-center gap-2 pb-2 bg-white pt-2">
            <button
              onClick={() => setRequestPage((prev) => Math.max(prev - 1, 0))}
              disabled={requestPage === 0}
              className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-1.5 text-black">{`Page ${
              requestPage + 1
            } of ${totalRequestPages}`}</span>
            <button
              onClick={() =>
                setRequestPage((prev) =>
                  Math.min(prev + 1, totalRequestPages - 1)
                )
              }
              disabled={requestPage >= totalRequestPages - 1}
              className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
            <div className="flex items-center gap-2">
              <select
                className="bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500"
                onChange={(e) => PageSizeChange(e.target.value)}
                value={requestSize.toString()}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="ml-1">per page</span>
            </div>
          </div>

        
      </div>
    </div>
  );
};

export default BatchListPage;