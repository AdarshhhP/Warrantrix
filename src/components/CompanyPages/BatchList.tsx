import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Popover from "@radix-ui/react-popover";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import axios from "axios";

type BatchResponse = {
  modelNo: string;
  batchNo: string;
  serialNo: string[];
};

const BatchListPage = () => {
  const [batches, setBatches] = useState<BatchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serialInputs, setSerialInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const navigate = useNavigate();

  // Fetch batches from backend
  const fetchBatches = async () => {
    try {
      const response = await axios.get<BatchResponse[]>(
        "http://localhost:1089/api/batch/list"
      );
      setBatches(response.data);
    } catch (err) {
      console.error("Failed to fetch batches", err);
      setError("Failed to load batches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Update input value for specific batch
  const handleInputChange = (batchNo: string, value: string) => {
    setSerialInputs((prev) => ({ ...prev, [batchNo]: value }));
  };

  // API call to add serial number
  const handleAddSerial = async (batchNo: string, serial: string) => {
    if (!serial.trim()) return;
    try {
      await axios
        .post("http://localhost:1089/api/batch/add-serials", {
          batchNo: batchNo,
          serialNumbers: [serial], // ✅ send as array to match backend
        })
        .then(() => {
          toast("Serial number added successfully"); // Show toast success message
          console.log("hello");
        });

      // Update UI immediately
      setBatches((prev) =>
        prev.map((batch) =>
          batch.batchNo === batchNo
            ? { ...batch, serialNo: [...batch.serialNo, serial] }
            : batch
        )
      );
      // Clear input field
      handleInputChange(batchNo, "");
    } catch (err) {
      console.error("Error adding serial number", err);
      alert("Failed to add serial number");
    }
  };

  // Table columns
  const columns: ColumnDef<BatchResponse>[] = [
    {
      accessorKey: "modelNo",
      header: "Model Number",
    },
    {
      accessorKey: "batchNo",
      header: "Batch Number",
      cell: ({ row }) => {
        const batchNo = row.original.batchNo;
        const [serialInput, setSerialInput] = useState("");

        const handleSubmit = () => {
          handleAddSerial(batchNo, serialInput);
          setSerialInput("");
        };

        return (
          <div className="flex items-center gap-2">
            <span>{batchNo}</span>

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                  title="Add Serial Number"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title className="text-black font-bold">
                      Add Serial Numbers
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
                    Submit
                  </button>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        );
      },
    },
    {
      id: "serialNoList",
      header: "Serial Numbers",
      cell: ({ row }) => {
        const serials = row.original.serialNo;
        return (
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="text-blue-600 underline text-sm hover:text-blue-800">
                View
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="rounded p-4 w-64 bg-white border shadow-lg z-50"
                side="top"
                align="start"
              >
                <h3 className="text-lg font-semibold mb-2">Serial Numbers</h3>
                <div className="text-lg whitespace-pre-wrap break-words text-gray-700">
                  {serials.length > 0 ? serials.join(", ") : "No serials yet"}
                </div>
                <Popover.Arrow className="fill-white" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        );
      },
    },
  ];

  const table = useReactTable({
    data: batches,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-100">
                  <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Batch List</h1>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-300 bg-white shadow">
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
    </div>
  );
};

export default BatchListPage;
