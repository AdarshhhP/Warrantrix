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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<SerialNumber[]>([]);
  
  const [modelNo, setModelNo] = useState<string>("");
  const [productid, setProductid] = useState<number | null>(null);
  const [refetch, setRefetch] = useState(false);
  const [activeTab, setActiveTab] = useState<"unsold" | "sold">("unsold");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const params = useParams();
  const [serialNo, setSerialNo] = useState<string>("");

  // Pagination states
  const [unsoldPage, setUnsoldPage] = useState(0);
  const [soldPage, setSoldPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [unsoldTotalPages, setUnsoldTotalPages] = useState(1);
  const [soldTotalPages, setSoldTotalPages] = useState(1);

  useEffect(() => {
    if (params.prod_id !== undefined) {
      const productId = parseInt(params.prod_id);
      setIsLoading(true);

      // Fetch unsold serials (is_sold = 0)
      companyService.fetchSerialData(productId, 0, unsoldPage, pageSize, serialNo)
      .then((response) => {
        setUnsoldSerials(response.data.content);
        setUnsoldTotalPages(response.data.totalPages || 1);
        setProductid(productId);
        setModelNo(response.data.content[0]?.model_No || "");
      });

      // Fetch sold serials (is_sold = 1)
      companyService
        .fetchSerialData(productId, 1, soldPage, pageSize, serialNo)
        .then((response) => {
          setSoldSerials(response.data.content);
          setSoldTotalPages(response.data.totalPages || 1);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [params, refetch, unsoldPage, soldPage, pageSize]);

  // 🔹 Reset filteredData whenever tab or API data changes
  useEffect(() => {
    if (activeTab === "unsold") {
      setFilteredData(unsoldSerials);
    } else {
      setFilteredData(soldSerials);
    }
  }, [unsoldSerials, soldSerials, activeTab]);

  // 🔹 Search handler
  // const handleSearch = () => {
  //   const data = activeTab === "unsold" ? unsoldSerials : soldSerials;
  //   const filtered = data.filter(
  //     (item) =>
  //       item.serialNo.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  //   setFilteredData(filtered);
  // };
  const handleSearch = () => {
  setSerialNo(searchTerm);   // this triggers useEffect and refetches from API
  setUnsoldPage(0); // reset page to 0 when searching
  setSoldPage(0);
};
 
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

      await companyService.postBatch(payload).then(async () => {
        setRefetch(!refetch);
      });

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
      cell: ({ row }) => (activeTab === "unsold" 
        ? unsoldPage * pageSize + row.index + 1 
        : soldPage * pageSize + row.index + 1),
    },
    {
      accessorKey: "serialNo",
      header: "Serial Number",
    },
    {
      accessorKey: "man_date",
      header: "Manufacture Date"
    }
  ];
 
  const currentData = activeTab === "unsold" ? unsoldSerials : soldSerials;
  const currentPage = activeTab === "unsold" ? unsoldPage : soldPage;
  const totalPages = activeTab === "unsold" ? unsoldTotalPages : soldTotalPages;
  
  const table = useReactTable({
    data: currentData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = (newPage: number) => {
    if (activeTab === "unsold") {
      setUnsoldPage(newPage);
    } else {
      setSoldPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    // Reset to first page when changing page size
    if (activeTab === "unsold") {
      setUnsoldPage(0);
    } else {
      setSoldPage(0);
    }
  };
 
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
    <div className="container mx-auto px-4 py-8 bg-stone-200 min-h-full max-h-fit">
      <Toaster />
      <div className="flex items-center mb-3 gap-2">
        <button
          onClick={() => navigate(-1)}
          className=" text-black bg-transparent text-lg p-2 rounded-full hover:bg-stone-400 bg-stone-600 transition-colors flex items-center justify-center"
        >
          <ArrowLeft size={15} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Manage Batches</h1>
      </div>
 
      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-200 gap-2 justify-between">
        <div className="flex border-b border-gray-200 gap-2">
          <button
            onClick={() => setActiveTab("unsold")}
            className={`px-4 py-1 font-medium ${
              activeTab === "unsold"
                ? "border-b-2 border-gray-500 text-white bg-stone-900"
                : "hover:text-white bg-stone-500 text-white"
            }`}
          >
            Unbatched Items
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={`px-4 py-1 font-medium ${
              activeTab === "sold"
                ? "border-b-2 border-gray-500 text-white bg-stone-900"
                : "hover:text-white bg-stone-500 text-white"
            }`}
          >
            Batched Items
          </button>
        </div>
        {selectedSerials.size > 0 && (
          <button
            onClick={handleCreateBatch}
            className="h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex justify-center items-center"
          >
            Create Batch
          </button>
        )}
              {/* 🔍 Search bar */}
      <div className="flex items-center gap-2 w-full sm:w-auto mb-4">
        <input
          type="text"
          placeholder="Search Serial No"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="px-3 py-1.5 text-black bg-white border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-1 focus:ring-gray-500 
                     focus:border-gray-500 w-full sm:w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-teal-500 text-white px-3 py-1.5 text-sm rounded-md 
                     hover:bg-teal-700 transition"
        >
          Search
        </button>
      </div>
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
            <div className="flex justify-between items-center">
              {/* <p className="text-gray-600">
                {selectedSerials.size > 0
                  ? `${selectedSerials.size} selected`
                  : `${currentData.length} items`}
              </p> */}
            </div>
          )}
          <div className="bg-white rounded shadow p-4 mb-3 text-black">
            <p>
              <strong>Model No:</strong> {modelNo || "N/A"}
            </p>
          </div>
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

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 pb-2 pt-2 bg-white mt-4">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
              disabled={currentPage === 0}
              className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-1.5 text-black">{`Page ${
              currentPage + 1
            } of ${totalPages}`}</span>
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
            <div className="flex items-center gap-2">
              <select
                className="bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500"
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                value={pageSize.toString()}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="ml-1 text-black">per page</span>
            </div>
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