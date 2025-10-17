"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import SmallLoader from "../Loader/SmallLoader";
import authService from "../../services/AuthServices";

const Admin = () => {
  const { register, handleSubmit, reset } = useForm();
  const [userType, setUserType] = useState(3); // Default to Company
  const [loader, setloader] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setloader(true);
    try {
      const payload = {
        userName: data.userName,
        email: data.email,
        password: data.password,
        userType: userType,
      };

      const response = await authService.createUser(payload);

      if (response.statusCode === 200) {
        // alert("User created successfully!");
        toast.success("New user created");
        reset();
        setUserType(2); // Reset to default
        setloader(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      //alert("Error: " + (error.response?.data?.message || error.message));
      toast.success(
        "Error: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-100 p-8">
      <Toaster />
      <div className="w-full max-w-md bg-teal-600 shadow-md rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Create User</h2>
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
            {loader ? (
              <div className="flex justify-center items-center">
                <SmallLoader />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                Create Account
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
