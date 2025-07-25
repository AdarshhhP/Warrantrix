import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import CustomSidebar from "./components/Sidebar/CustomSidebar";
// import ProtectedLayout from "./ProtectedLayout";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AppLayout = ({ children }: any) => {

  return (
    // <ProtectedLayout>
        <div className="flex sm:h-[100vh] w-[100vw] bg-gray-100">
          {/* Sidebar */}
          <Navbar/>
          <CustomSidebar />
          {
            children
          }
          {/* Main Content */}
        </div>
    //   </ProtectedLayout>
  );
};

export default AppLayout;
