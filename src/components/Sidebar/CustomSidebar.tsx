// CustomSidebar.tsx
import React from "react";

const CustomSidebar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Sidebar</h2>
        {/* Add your sidebar nav here */}
        <ul>
          <li className="mb-2"><a href="/dashboard">Dashboard</a></li>
          {/* More links */}
        </ul>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default CustomSidebar;
