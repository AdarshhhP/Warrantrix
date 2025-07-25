import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/CustomSidebar";
import Company from "./components/CompanyPages/Company";
import Seller from "./components/Seller/Seller";
import CompanyReport from "./components/CompanyPages/CompanyReport";
import Customer from "./components/Customer/Customer";
import Dashboard from "./components/Landingpage/Dashboard";
import SellerReport from "./components/Seller/SellerReport";
import Login from "./components/Login/Login";
import Admin from "./components/Admin/Admin";
import Navbar from "./components/Navbar/Navbar"; // ✅ import Navbar

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const checkToken = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      setToken(currentToken);
    }, 500);
    return () => clearInterval(checkToken);
  }, []);

  console.log("Token in App:", token);

  return (
    <Router>
      {token ? (
        <div className="flex flex-col h-screen w-screen">
          <Navbar /> {/* ✅ Add Navbar here */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-full">
              <Routes>
                <Route path="/company" element={<Company />} />
                <Route path="/seller" element={<Seller />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/reports/companyreport" element={<CompanyReport />} />
                <Route path="/reports/sellerreports" element={<SellerReport />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<Login setToken={setToken} />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;
