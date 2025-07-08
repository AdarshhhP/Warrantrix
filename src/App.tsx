import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomSidebar from "./components/Sidebar/CustomSidebar";
import Dashboard from "./components/Landingpage/Dashboard";

// Example routes
const routes = [
  { path: "/dashboard", element: <Dashboard /> },
  // Add more routes
];

const roleBasedRoutes = {
  EM345: ["/dashboard"],
  RM678: ["/dashboard"],
  HR901: ["/dashboard"],
  LC234: ["/dashboard"],
};

const getFilteredRoutes = (userRole: keyof typeof roleBasedRoutes) => {
  const allowedRoutes = roleBasedRoutes[userRole] || [];
  return routes.filter((route) => allowedRoutes.includes(route.path));
};

const App = () => {
  const userRole = (localStorage.getItem("systemRole") || "EM345") as keyof typeof roleBasedRoutes;
  const filteredRoutes = getFilteredRoutes(userRole);

  return (
    <Router>
      <CustomSidebar>
        <Routes>
          {filteredRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </CustomSidebar>
    </Router>
  );
};

export default App;
