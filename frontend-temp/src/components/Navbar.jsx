import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/store";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-gray-800 dark:to-gray-900 text-white px-6 py-4 shadow-lg flex justify-between items-center transition-all duration-300">

      <div>
        <h1 className="font-bold text-2xl">Production Incentive Management System</h1>
        <p className="text-sm text-blue-100 dark:text-gray-300">Industrial Workflow Management</p>
      </div>

      <div className="flex items-center gap-3">

        {/* User info */}
        <div className="flex items-center gap-2">
          <FaUserCircle size={24} />
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-blue-100 dark:text-gray-300">
              {user?.role?.replace("_", " ").toUpperCase()}
            </p>
          </div>
        </div>

        {/* Notification bell */}
        <NotificationBell />

        {/* Logout */}
        <button
          onClick={() => dispatch(logout())}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium"
        >
          <FaSignOutAlt size={14} />
          Logout
        </button>

      </div>
    </div>
  );
}