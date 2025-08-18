import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import Navbar from "../Navbar/Navbar";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("company");
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const storedTab = localStorage.getItem("activetab") || "company";
    const storedUserType = localStorage.getItem("user_type");
    setActiveTab(storedTab);
    setUserType(storedUserType);
  }, []);

  const handleTabClick = (tab: string, route: string) => {
    setActiveTab(tab);
    localStorage.setItem("activetab", tab);
    navigate(route);
  };

  const isActive = (tab: string) =>
    activeTab === tab
      ? "w-full text-left px-4 py-2 bg-teal-300 text-black rounded"
      : "w-full text-left px-4 py-2 hover:bg-teal-300 rounded bg-white text-black";

  return (
    <div>
      {/* <Navbar/> */}
      <div
        className="h-screen w-64 bg-gradient-to-l from-slate-800 to-teal-700
  text-white p-4 flex flex-col z-50"
      >
        <div className="space-y-4">
          {/* <h2 className="text-xl font-bold mb-6">Dashboard</h2> */}

          {userType === "3" && (
            <>
              <button
                className={isActive("company")}
                onClick={() => handleTabClick("company", "/company")}
              >
                Company
              </button>
              <button
                className={isActive("rcompany")}
                onClick={() =>
                  handleTabClick("rcompany", "/reports/companyreport")
                }
              >
                Company Report
              </button>
              <button
                className={isActive("wcompany")}
                onClick={() =>
                  handleTabClick("wcompany", "/reports/companyrequests")
                }
              >
                Raised Warranty Requests
              </button>
              <button
              className={isActive("bcompany")}
              onClick={() =>
                handleTabClick("bcompany","/Batch")
              }
              >
                Batch List
              </button>
            </>
          )}

          {userType === "2" && (
            <>
              <button
                className={isActive("seller")}
                onClick={() => handleTabClick("seller", "/seller")}
              >
                Seller
              </button>
              <button
                className={isActive("aseller")}
                onClick={() => handleTabClick("aseller", "/serialacknowledge")}
              >
                Seller Acknowledge
              </button>
              <button
                className={isActive("rseller")}
                onClick={() =>
                  handleTabClick("rseller", "/reports/sellerreports")
                }
              >
                Seller Report
              </button>
              <button
                className={isActive("pseller")}
                onClick={() =>
                  handleTabClick("pseller", "/reports/sellerpurchases")
                }
              >
                Sold Items
              </button>
            </>
          )}

          {userType === "1" && (
            <>
            <button
              className={isActive("customer")}
              onClick={() => handleTabClick("customer", "/customer")}
            >
              Customer
            </button>
             <button
              className={isActive("wcustomer")}
              onClick={() => handleTabClick("wcustomer", "/customer/warrantyrequests")}
            >
              Raised Requests 
            </button>
            </>
          )}
          {userType === "4" && (
            <>
            <button
              className={isActive("admin")}
              onClick={() => handleTabClick("admin", "/admin")}
            >
              User Creation
            </button>
            <button
              className={isActive("userlist")}
              onClick={() => handleTabClick("userlist", "/userlist")}
            >
              User List
            </button>
            </>
          )}
        </div>

        <div className="mt-auto pt-4">
          <button
            className="w-full bg-blue-200 px-4 py-2 rounded hover:bg-blue-500 text-black transition"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

// 1 7 11 12
//94,87,92,93,92,86
//101,91,91,95,96,90
