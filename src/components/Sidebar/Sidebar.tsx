// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import CloseIcon from "../Icons/close/Closemenu";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "../../components/ui/alert-dialog";
// import SignOutIcon from "../Icons/signout/SignOutIcon";
// import LeftDoubleArrow from "../Icons/arrow/LeftDoubleArrow";
// import useSignOut from "../../hooks/useSignOut";
// import { useLocation } from "react-router-dom";
// import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip";
// import { TooltipTrigger } from "@radix-ui/react-tooltip";
// import { SidebarData } from "./SidebarData";
// import { useNavigate } from "react-router-dom";
 
// interface SidebarProps {
//   sidebarOpen: boolean;
//   setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
// }
 
// const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const currentPath = location.pathname;
 
//   const [activeMenu, setActiveMenu] = useState<string | null | undefined>(
//     "userlist_menu"
//   );
//   const [isCollapsed, setIsCollapsed] = useState<boolean>(
//     () => JSON.parse(localStorage.getItem("sidebar-collapsed") || "false")
//   );
 
//   const handleSignOut = useSignOut();
 
//   useEffect(() => {
//     const currentPathIs = SidebarData?.find(
//       (item: any) => item?.link === currentPath
//     );
//     setActiveMenu(currentPathIs?.id);
//   }, [currentPath]);
 
//   useEffect(() => {
//     localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
//   }, [isCollapsed]);

//   const handleNavigation = () => {
//     navigate("/userlist");
//   };
 
//   return (
//     <>
//       {/* Toggle Button for Mobile */}
//       <button
//         aria-label="Toggle Sidebar"
//         className={`sm:hidden fixed top-4 z-50 p-2 text-white rounded-md transition-transform duration-700 ${
//           sidebarOpen ? "right-2" : "left-2"
//         }`}
//         onClick={() => setSidebarOpen(!sidebarOpen)}
//       >
//         <div
//           className={`transition-transform duration-700 transform ${
//             sidebarOpen ? "rotate-180" : ""
//           }`}
//         >
//           {sidebarOpen ? <CloseIcon /> : ""}
//         </div>
//       </button>
 
//       <div
//         className={`fixed top-0 left-0 z-40 bg-slate-700 text-white p-4 h-full shadow-2xl transition-all duration-300 ease-in-out ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } ${isCollapsed ? "w-[90px]" : "w-[230px]"} sm:relative sm:translate-x-0 flex flex-col`}
//       >
//         {/* Collapse Button */}
//         <button
//           className="absolute top-2 right-[-25px] bg-black text-white p-1 rounded-md sm:block hidden"
//           onClick={() => setIsCollapsed(!isCollapsed)}
//         >
//           {isCollapsed ? <LeftDoubleArrow rotate={true}/> : <LeftDoubleArrow rotate={false}/>}
//         </button>
 
//         {/* Sidebar Header */}
//         <div className="flex flex-col items-center mb-4 p-4">
//           <h1
//             onClick={handleNavigation}
//             className={`text-2xl font-bold transition-all duration-300 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 cursor-pointer ${
//               isCollapsed ? "" : "opacity-100"
//             } hover:scale-105`}
//           >
//             HRD+
//           </h1>
 
//           {!isCollapsed && <hr className="w-full border-gray-600 mt-4" />}
//         </div>
 
//         {/* Sidebar Menu */}
//         {SidebarData.map((menu) => (
//           <div key={menu.id}>
//             <Link
//               to={menu.link}
//               onClick={() => {
//                 setActiveMenu(menu.id);
//                 setSidebarOpen(false);
//               }}
//             >
//               <div
//                 className={`flex ${
//                   isCollapsed ? "justify-center" : "items-center gap-2"
//                 } p-2 rounded-md cursor-pointer mt-3 ${
//                   activeMenu === menu.id
//                     ? "text-white text-sm bg-gradient-to-l from-slate-800 to-teal-700"
//                     : "text-gray-300 text-sm hover:bg-gray-800"
//                 }`}
//               >
//                 {isCollapsed ? (
//                   <TooltipProvider>
//                     <Tooltip>
//                       <TooltipTrigger>
//                         {activeMenu === menu.id ? menu.icon : menu.icontwo}
//                       </TooltipTrigger>
//                       <TooltipContent>{menu.title}</TooltipContent>
//                     </Tooltip>
//                   </TooltipProvider>
//                 ) : activeMenu === menu.id ? (
//                   menu.icon
//                 ) : (
//                   menu.icontwo
//                 )}
 
//                 {!isCollapsed && <span>{menu.title}</span>}
//               </div>
//             </Link>
//           </div>
//         ))}
 
//         {/* Sign Out Button */}
//         <div className="mt-auto">
//           <AlertDialog>
//             <AlertDialogTrigger asChild>
//               <button
//                 aria-label="Sign Out"
//                 className={`flex items-center gap-2 p-2 text-black text-sm justify-center font-bold hover:text-white rounded-md bg-slate-300 hover:opacity-80 w-full`}
//               >
//                 <SignOutIcon />
//                 {!isCollapsed && "Sign Out"}
//               </button>
//             </AlertDialogTrigger>
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
//                 <AlertDialogDescription>
//                   This action will sign you out and return you to the login
//                   page.
//                 </AlertDialogDescription>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                 <AlertDialogAction onClick={handleSignOut}>
//                   Continue
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>
//         </div>
//       </div>
 
//       {/* Overlay for Mobile */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}
//     </>
//   );
// };
 
// export default Sidebar;