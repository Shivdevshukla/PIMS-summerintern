import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ThemeToggle from "./ThemeToggle";

export default function Layout() {
  return (
    <div
      className="
      flex
      min-h-screen
      bg-gray-100
      dark:bg-gray-900
      transition-colors
      duration-300
      "
    >
      <Sidebar />

      <div className="flex-1">

        <Navbar />

        {/* Theme Button */}
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>

        <main
          className="
          p-6
          text-gray-800
          dark:text-white
          "
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
}