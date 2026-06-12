import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/store";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-3 shadow-sm flex justify-between items-center transition-all duration-300 sticky top-0 z-30">

      {/* Page title area */}
      <div>
        <h1 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
          Production Incentive Management System
        </h1>
        <p className="text-xs text-gray-400">Universal Cables Limited — Industrial Workflow</p>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell />

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 dark:bg-slate-600"></div>

        {/* User info */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">{user?.name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              {user?.role?.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => dispatch(logout())}
          title="Logout"
          className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 px-3 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
        >
          <FaSignOutAlt size={14} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}