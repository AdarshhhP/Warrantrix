"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import authService from "../../services/AuthServices";

interface LoginProps {
  setToken: (token: string) => void;
}

export default function Login({ setToken }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        const result = await authService.login(data.email, data.password);

        if (result.statusCode === 200) {
          setToken(result.jwt);
          localStorage.setItem("token", result.jwt);
          localStorage.setItem("user_type", result.user_type);
          localStorage.setItem("user_name",result.user_name);

          const userType = result.user_type.toString();
          const userId = result.user_id.toString();

          if (userType === "1") {
            localStorage.setItem("user_id", userId);
            navigate("/customer");
          } else if (userType === "2") {
            localStorage.setItem("seller_id", userId);
            navigate("/seller");
          } else if (userType === "3") {
            localStorage.setItem("company_id", userId);
            navigate("/company");
          } else if (userType === "4") {
            navigate("/admin");
          }

          const userDetails = await authService.getUserDetails(userId);
          if (userDetails?.userName) {
            localStorage.setItem("user_name", userDetails.userName);
          }
        }
      } else {
        await authService.signup(data.userName, data.email, data.password);
        alert("Signup successful! You can now log in.");
        setIsLogin(true);
        reset();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="w-screen h-screen bg-blue-200 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-300">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              reset();
            }}
            className={`px-5 py-2 rounded-full font-medium transition ${
              isLogin
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              reset();
            }}
            className={`px-5 py-2 rounded-full font-medium transition ${
              !isLogin
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <input
              {...register("userName")}
              type="text"
              placeholder="Username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-black bg-white"
            />
          )}
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            required
            className="w-full bg-white text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 "
          />
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 bg-white text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
