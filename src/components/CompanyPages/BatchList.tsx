import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';

// Type definition
type BatchResponse = {
  modelNo: string;
  batchNo: string;
  serialNo: string[];
};

const BatchListPage = () => {
  const [batches, setBatches] = useState<BatchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch batch data
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get<BatchResponse[]>("http://localhost:1089/api/batch/list");
        setBatches(response.data);
      } catch (err) {
        console.error("Failed to fetch batches", err);
        setError("Failed to load batches");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatches();
  }, []);

  // Define columns
  const columns: ColumnDef<BatchResponse>[] = [
    {
      accessorKey: "modelNo",
      header: "Model Number",
    },
    {
      accessorKey: "batchNo",
      header: "Batch Number",
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
              {serials.join(", ")}
            </div>
            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }
}
  ];

  const table = useReactTable({
    data: batches,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Page content
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Batch List</h1>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-300 bg-white shadow">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200 text-gray-700 text-left">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="border border-gray-300 px-4 py-2 text-sm font-semibold"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="border border-gray-300 px-4 py-2 text-sm text-gray-800 align-top"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
