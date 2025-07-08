import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomSidebar from "../components/Sidebar/CustomSidebar";
import Dashboard from "../components/Landingpage/Dashboard";

// import Userlist from "../pages/UserMaster/Userlist";

// Define route configuration
const routes = [
  { path: "/sidebar", element: <Dashboard /> },
 

];

// Define allowed routes for each role
const roleBasedRoutes = {
  EM345: ["/assessment"],
  RM678: [
    "/manageremployeelist"
   

  ],
  HR901: [
    "/userlist",
 
    "/reviewrequest/:id",
  ],
  LC234: ["/traininglist", "/createtraining", "/createtraining/:id"],
  
};

const getFilteredRoutes = (userRole: keyof typeof roleBasedRoutes) => {
  // Get allowed routes for the user role
  const allowedRoutes = roleBasedRoutes[userRole] || [];

  // Filter routes based on allowed routes
  return routes.filter((route) => allowedRoutes.includes(route.path));
};

const Routers = () => {
//   const userRole = secureLocalStorage
//     .getItem("systemRole")
//     ?.toString() as keyof typeof roleBasedRoutes;

  const userRole = localStorage
    .getItem("systemRole")
    ?.toString() as keyof typeof roleBasedRoutes;

  // Get filtered routes based on user role
  const filteredRoutes = getFilteredRoutes(userRole);

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/"
          element={
            <CustomSidebar/>
            
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            // <AppLayout>
              <Routes>
                {filteredRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
                {/* Catch-all Route */}
                <Route path="*" element={<Dashboard />} />
              </Routes>
            // </AppLayout> 
          }
        />
      </Routes>
    </Router>
  );
};

export default Routers;
