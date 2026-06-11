import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);

  const navClass = ({ isActive }) =>
    `block p-3 rounded-lg transition text-sm font-medium
    ${isActive
      ? "bg-blue-600 text-white"
      : "hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
    }`;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg min-h-screen transition-colors duration-300">

      {/* Logo */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">PIMS</h2>
        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
          {user?.role?.replace(/_/g, " ").toUpperCase()}
        </p>
      </div>

      {/* Menu */}
      <div className="p-3 space-y-1">

        <NavLink to="/" end className={navClass}>Dashboard</NavLink>

        {user?.role !== "admin" && (
          <NavLink to="/change-password" className={navClass}>Change Password</NavLink>
        )}

        {user?.role === "shift_incharge" && (
          <NavLink to="/create-entry" className={navClass}>Create Entry</NavLink>
        )}

        {user?.role === "hod" && (
          <>
            <NavLink to="/hod-dashboard" className={navClass}>HOD Dashboard</NavLink>
            <NavLink to="/activity-log" className={navClass}>Activity Log</NavLink>
          </>
        )}

        {user?.role === "superintendent" && (
          <>
            <NavLink to="/superintendent-dashboard" className={navClass}>Superintendent Dashboard</NavLink>
            <NavLink to="/activity-log" className={navClass}>Activity Log</NavLink>
          </>
        )}

        {user?.role === "hr" && (
          <>
            <NavLink to="/hr-dashboard" className={navClass}>HR Dashboard</NavLink>
            <NavLink to="/reports-dashboard" className={navClass}>Reports Dashboard</NavLink>
            <NavLink to="/activity-log" className={navClass}>Activity Log</NavLink>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <NavLink to="/reports-dashboard" className={navClass}>Reports Dashboard</NavLink>
            <NavLink to="/workers" className={navClass}>Worker Management</NavLink>
            <NavLink to="/users" className={navClass}>User Management</NavLink>
            <NavLink to="/activity-log" className={navClass}>Activity Log</NavLink>
          </>
        )}

      </div>
    </div>
  );
}