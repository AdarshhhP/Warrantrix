/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import authService from "../../services/AuthServices";
import { useNavigate } from "react-router-dom";

type User = {
  userName: string;
  email: string;
  userType: number;
  userId:number;
};

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
const navigate=useNavigate();
  const userTypeLabels: Record<number, string> = {
    1: "Customer",
    2: "Seller",
    3: "Company",
    4: "Admin",
    5: "Other"
  };
//garbage collections
//docker
//callbackfunctions

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await authService.fetchUsers({
        page,
        size,
        userType: userTypeFilter
      });
      setUsers(res.userinfo || []);
      setTotalPages(res.totalPages || 1
      );
    } catch (err: any) {
      alert("Error loading users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!users || users.length === 0) {
      alert("No data to download");
      return;
    }

    const keyLabelMap: Record<string, string> = {
      userName: "Username",
      email: "Email",
      userType: "User Type"
    };

    const filteredData = users.map((user: any) => {
      const row: any = {};
      Object.keys(user).forEach((key) => {
        if (keyLabelMap[key]) {
          row[keyLabelMap[key]] = 
            key === "userType" 
              ? userTypeLabels[user[key]] || "Unknown"
              : user[key];
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, `users_report.xlsx`);
  };

  useEffect(() => {
    loadUsers();
  }, [page, size, searchTerm, userTypeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadUsers();
  };

  const handleview=(userId:number,userType:number)=>{
if(userType==1){
navigate(`/customer/${userId}`)
}else if(userType==2){
navigate(`/seller/${userId}`)
}else if(userType==3){
  navigate(`/company/${userId}`)
}
  }

  return (
    <div className="p-6 bg-stone-200 h-full text-black space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={handleDownload}
          className="flex items-center bg-teal-600 h-8 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition"
        >
          Download as Excel
        </button>
      </div>

      <div className="flex flex-row justify-between">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-md shadow-sm text-sm">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              className="text-gray-900 placeholder-gray-900 border border-gray-700 rounded px-3 py-1 w-48 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white"
            />

            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="text-gray-900 border placeholder-gray-900 border-gray-700 rounded px-3 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white"
            >
              <option value="">All User Types</option>
              <option value="1">Customer</option>
              <option value="2">Seller</option>
              <option value="3">Company</option>
            </select>

            <button
              type="submit"
              className="bg-teal-600 text-gray-100 px-4 py-1.5 rounded hover:bg-gray-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="">
        <div className="border border-gray-300 shadow-sm flex flex-col justify-between h-[215px] overflow-x-auto">
          <table className="min-w-full table-auto text-sm text-left text-gray-800 bg-white">
            <thead className="bg-gray-100 sticky top-0 z-10 text-gray-900">
              <tr>
                <th className="px-4 py-1 border">Sl No</th>
                <th className="px-4 py-1 border">Username</th>
                <th className="px-4 py-1 border">Email</th>
                <th className="px-4 py-1 border">User Type</th>
                <th className="px-4 py-1 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-t">
                    <td className="px-4 py-2 border">
                      {page * size + index + 1}
                    </td>
                    <td className="px-4 py-2 border">{user.userName}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">
                      {userTypeLabels[user.userType] || "Unknown"}
                    </td>
                    <td className="px-6 py-2 border cursor-pointer"onClick={()=>handleview(user.userId,user.userType)}>👁️</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center gap-2 pb-2 pt-2 bg-white">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
            className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-4 py-1.5">{`Page ${
            page + 1
          } of ${totalPages}`}</span>
          <button
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={page >= totalPages - 1}
            className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
          <div className="flex items-center gap-2">
            <select
              className="bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500"
              onChange={(e) => setSize(Number(e.target.value))}
              value={size.toString()}
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

export default UserList;