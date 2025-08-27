import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { SerialNumber } from "./Company";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import companyService from "../../services/CompanyServices";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";

const SerialNumbersPage = () => {
  const navigate = useNavigate();
  const [unsoldSerials, setUnsoldSerials] = useState<SerialNumber[]>([]);
  const [soldSerials, setSoldSerials] = useState<SerialNumber[]>([]);
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(
    new Set()
  );
  const [modelNo, setModelNo] = useState<string>("");
  const [productid, setProductid] = useState<number | null>(null);
  const [refetch, setRefetch] = useState(false);
  const [activeTab, setActiveTab] = useState<"unsold" | "sold">("unsold");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const params = useParams();
  
  useEffect(() => {
    if (params.prod_id !== undefined) {
      const productId = parseInt(params.prod_id);
      setIsLoading(true);

      // Fetch unsold serials (is_sold = 0)
      companyService.fetchSerialData(productId, 0, 0, 100).then((response) => {
        setUnsoldSerials(response.data.content);
        setProductid(productId);
        setModelNo(response.data.content[0]?.model_No || "");
      });

      // Fetch sold serials (is_sold = 1)
      companyService
        .fetchSerialData(productId, 1, 0, 100)
        .then((response) => {
          setSoldSerials(response.data.content);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [params, refetch]);
 
  const toggleSelectSerial = (id: string) => {
    setSelectedSerials((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
 
  const handleCreateBatch = () => {
    setShowConfirm(true);
  };
const confirmCreateBatch = async () => {
  try {
    const array = Array.from(selectedSerials);
 
    // Update serial statuses to sold
    const payload2 = {
      prod_id: productid,
      sold_status: 1,
      serialNos: array,
    };

    await companyService.changeSerialNoStatuses(payload2);
    
    // Create the batch
    const payload = {
      modelNo: modelNo,
      serialNumbers: array,
    };

    await companyService.postBatch(payload).then(async ()=>{
       setRefetch(!refetch);
    })
    
 setTimeout(() => {
      toast.success("Batch created successfully!");
    }, 300);
        setSelectedSerials(new Set());
    setShowConfirm(false);
  } catch (error) {
    console.error("Error creating batch:", error);
    toast.error("Failed to create batch");
  }
};

  const columns: ColumnDef<SerialNumber>[] = [
    {
      id: "select",
      // header: "Select",
      cell: ({ row }) => {
        // Only show checkbox in unsold tab and if is_sold is 0
        return activeTab === "unsold" && row.original.is_sold === 0 ? (
          <div>
            <input
              type="checkbox"
              checked={selectedSerials.has(row.original.serialNo)}
              onChange={() => toggleSelectSerial(row.original.serialNo)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        ) : null;
      },
    },
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "serialNo",
      header: "Serial Number",
    },
    {
      accessorKey: "model_No",
      header: "Model",
    },
    // {
    //   id: "status",
    //   header: "Batch Status",
    //   cell: ({ row }) => (
    //     <span
    //       className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
    //         row.original.is_sold == 0
    //           ? "bg-green-100 text-green-800"
    //           : "bg-red-100 text-red-800"
    //       }`}
    //     >
    //       {row.original.is_sold == 0 ? "Not Added to Batch" : "Added to Batch"}
    //     </span>
    //   ),
    // },
    // {
    //   id: "itemstatus",

    //   header: "Item Status",

    //   cell: ({ row }) => (
    //     <span
    //       className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
    //         row.original.is_sold == 0
    //           ? "bg-green-100 text-green-800"
    //           : "bg-red-100 text-red-800"
    //       }`}
    //     >
    //       {row.original.itemsStatus === 2
    //         ? "With Retail Seller"
    //         : row.original.itemsStatus === 3
    //         ? "Sold To Customer"
    //         : row.original.itemsStatus === 4
    //         ? "With Customer"
    //         : row.original.itemsStatus === 5
    //         ? "Raised Warranty Request"
    //         : row.original.itemsStatus === 1
    //         ? "In Company Stocks"
    //         : row.original.itemsStatus}
    //     </span>
    //   ),
    // },
  ];
 
  const currentData = activeTab === "unsold" ? unsoldSerials : soldSerials;
  const table = useReactTable({
    data: currentData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
 
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">

          g
        </div>
      </div>
    );
  }
 
  return (
    <div className="container mx-auto px-4 py-8 bg-stone-200 h-full">
                        <Toaster />
      <div className="flex items-center mb-6 gap-2">
        <button
          onClick={() => navigate(-1)}
          className=" text-black bg-transparent text-lg p-2 rounded-full hover:bg-stone-400 bg-stone-600 transition-colors flex items-center justify-center"
        >
          <ArrowLeft size={15} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Manage Batches</h1>
      </div>
 
      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab("unsold")}
          className={`px-4 py-2 font-medium ${
            activeTab === "unsold"
              ? "border-b-2 border-gray-500 text-white bg-stone-600"
              : "hover:text-white bg-stone-900 text-white"
          }`}
        >
          Unbatched Items
        </button>
        <button
          onClick={() => setActiveTab("sold")}
          className={`px-4 py-2 font-medium ${
            activeTab === "sold"
              ? "border-b-2 border-gray-500 text-white bg-stone-600"
              : "hover:text-white bg-stone-900 text-white"
          }`}
        >
          Batched Items
        </button>
      </div>
 
      {currentData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No {activeTab === "unsold" ? "unsold" : "sold"} serial numbers found
          </p>
        </div>
      ) : (
        <>
          {activeTab === "unsold" && (
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {selectedSerials.size > 0
                  ? `${selectedSerials.size} selected`
                  : `${currentData.length} items`}
              </p>
              {selectedSerials.size > 0 && (
                <button
                  onClick={handleCreateBatch}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Create Batch
                </button>
              )}
            </div>
          )}
 
          <div className="rounded-md border bg-white text-black">
            <Table>
              <TableHeader className="bg-stone-300 rounded-md p-1">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={
                        selectedSerials.has(row.original.serialNo) && "selected"
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            <p className="mb-4 text-gray-800">
              Are you sure you want to create this batch?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmCreateBatch}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default SerialNumbersPage;
