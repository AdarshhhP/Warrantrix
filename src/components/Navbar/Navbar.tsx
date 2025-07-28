import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const username = localStorage.getItem("user_name");

  return (
    <>
      {/* Navbar */}
      <div className="bg-gradient-to-l from-slate-800 to-teal-700 w-full h-16 flex items-center px-6 text-white shadow z-40 relative">
        <div className="justify-start flex">
 <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-white"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M4 4h16v2H4zm0 4h16v2H4zm2 4h12v10H6z" />
  </svg>
  <span className="text-xl font-bold text-white tracking-wide">Warrantix</span>
            </div>

        <div className="flex w-full justify-end items-center gap-4">
          {/* Username Display */}
          <div className="flex items-center gap-2 pr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.489 0 4.813.653 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-base font-medium text-white">
              {username || "User"}
            </span>
          </div>

          {/* Logout Button */}
          <button
            className="h-8 bg-blue-200 px-3 py-1.5 rounded hover:bg-blue-500 text-black transition flex items-center justify-center"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-2xl max-w-sm w-full text-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
