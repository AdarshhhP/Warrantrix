import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Sidebar from "./components/Sidebar/CustomSidebar";
import Company from "./components/CompanyPages/Company";
import Seller from "./components/Seller/Seller";
import CompanyReport from "./components/CompanyPages/CompanyReport";
import Customer from "./components/Customer/Customer";
import Dashboard from "./components/Landingpage/Dashboard";
import SellerReport from "./components/Seller/SellerReport";
import Login from "./components/Login/Login";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Listen to login state changes using the storage event (useful across tabs too)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Optional: update token when it changes in the same tab
  useEffect(() => {
    const checkToken = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      setToken(currentToken);
    }, 500); // check every 0.5s

    return () => clearInterval(checkToken);
  }, []);

  return (
    <Router>
      {token ? (
        <>
          <Sidebar />
          <div className="ml-64 min-h-screen bg-gray-100 p-6">
            <Routes>
              <Route path="/company" element={<Company />} />
              <Route path="/seller" element={<Seller />} />
              <Route path="/customer" element={<Customer />} />
              <Route path="/reports/companyreport" element={<CompanyReport />} />
              <Route path="/reports/sellerreports" element={<SellerReport />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="*" element={<Login setToken={setToken} />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;
