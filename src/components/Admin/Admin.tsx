"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";

const Admin = () => {
  const { register, handleSubmit, reset } = useForm();
  const [userType, setUserType] = useState(2); // Default to Company

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const payload = {
        userName: data.userName,
        email: data.email,
        password: data.password,
        userType: userType,
      };

      const response = await axios.post("http://localhost:2089/createuser", payload);

      if (response.status === 200) {
        // alert("User created successfully!");
        toast("New user created")
        reset();
        setUserType(2); // Reset to default
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-100 p-8">
      <Toaster/>
      <div className="w-full max-w-md bg-teal-600 shadow-md rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Create Seller or Company</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("userName")}
            type="text"
            placeholder="Username"
            required
            className="w-full px-4 h-8 border border-gray-300 rounded-lg bg-white text-gray-900"
          />
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 h-8 border border-gray-300 rounded-lg bg-white text-gray-900"
          />
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 h-8 border border-gray-300 rounded-lg bg-white text-gray-900"
          />
          <select
            value={userType}
            onChange={(e) => setUserType(Number(e.target.value))}
            className="w-full px-4 h-8 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value={3}>Company</option>
            <option value={2}>Seller</option>
          </select>
          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-700 transition"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;


