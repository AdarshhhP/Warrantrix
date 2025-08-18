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

const SerialNumbersPage = () => {
  const navigate = useNavigate();
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(
    new Set()
  );
  const [modelNo, setModelNo] = useState<string>("");
  const [productid,setproductid]=useState(null);
  const [refetch, setrefetch] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const params = useParams();
  console.log(params.prod_id, "params");

  useEffect(() => {
    if (params.prod_id !== undefined) {
      companyService
        .fetchSerialData(parseInt(params.prod_id))
        .then((Response) => {
          console.log(Response?.data?.productSerials, "aaaaaaaaaaa");
          setproductid(Response?.data?.prod_id)
          setSerialNumbers(Response?.data?.productSerials);
          setModelNo(Response?.data?.model_no);
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

  const handleDeleteSelected = () => {
    const array = Array.from(selectedSerials);

    const payload2 = {
      prod_id: productid,
      sold_status: 1,
      serialNos: array,
    };

    companyService.changeSerialNoStatuses(payload2).then((response) => {
      console.log(response);
    });

    const payload = {
      modelNo: modelNo,
      serialNumbers: array,
    };

    companyService.postBatch(payload).then((response) => {
      console.log(response);
      setrefetch(!refetch);
    });

    // const updatedSerials = serialNumbers.filter(
    //   serial => !selectedSerials.has(serial.prod_id)
    // );
    // setSerialNumbers(updatedSerials);
    // localStorage.setItem("serialNumbers", JSON.stringify(updatedSerials));
    // setSelectedSerials(new Set());
  };

  const columns: ColumnDef<SerialNumber>[] = [
    {
      id: "select",
      header: "Select",
      cell: ({ row }) => {
        // Only show checkbox if is_sold is 0
        return row.original.is_sold === 0 ? (
          <div>
            <input
              type="checkbox"
              checked={selectedSerials.has(row.original.serialNo)}
              onChange={() => toggleSelectSerial(row.original.serialNo)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        ) : null; // Return null if is_sold is not 0 (don't render checkbox)
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
    {
      id: "status",
      header: "Batch Status",
      cell: ({ row }) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.original.is_sold == 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.is_sold == 0 ? "Not Added to Batch" : "Added to Batch"}
        </span>
      ),
    },
    {
      id:"itemstatus",
   
          header: "Item Status",

    cell: ({ row }) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.original.is_sold == 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
{row.original.itemsStatus === 2
                          ? "With Retail Seller"
                          : row.original.itemsStatus === 3
                          ? "Sold To Customer"
                          : row.original.itemsStatus === 4
                          ? "With Customer"
                          : row.original.itemsStatus === 5
                          ? "Raised Warranty Request"
                          : row.original.itemsStatus === 1
                          ? "In Company Stocks"
                          : row.original.itemsStatus}

        </span>
      ),
 },
  ];

  const table = useReactTable({
    data: serialNumbers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
  //         {error}
  //       </div>
  //     </div>
  //   );
  // }
  console.log(serialNumbers, "serialNumbers");
  return (
    <div className="container mx-auto px-4 py-8 bg-stone-200 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Manage Batches
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 hover:bg-gray-300 rounded-md transition-colors bg-stone-600 h-8 flex justify-center items-center"
        >
          Back
        </button>
      </div>

      {serialNumbers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No serial numbers found</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {selectedSerials.size > 0
                ? `${selectedSerials.size} selected`
                : `${serialNumbers.length} items`}
            </p>
            {selectedSerials.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Create Batch
              </button>
            )}
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
        </>
      )}
    </div>
  );
};

export default SerialNumbersPage;
