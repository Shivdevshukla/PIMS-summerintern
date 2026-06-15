import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaTachometerAlt, FaKey, FaPlusCircle, FaClipboardCheck,
  FaChartBar, FaUsers, FaUserCog, FaHistory, FaIndustry
} from "react-icons/fa";

const ICONS = {
  dashboard: FaTachometerAlt,
  password: FaKey,
  create: FaPlusCircle,
  approve: FaClipboardCheck,
  reports: FaChartBar,
  workers: FaUsers,
  users: FaUserCog,
  activity: FaHistory,
};

const ROLE_COLORS = {
  shift_incharge: "from-blue-600 to-indigo-600",
  hod: "from-purple-600 to-pink-600",
  superintendent: "from-orange-500 to-amber-600",
  hr: "from-emerald-600 to-teal-600",
  admin: "from-slate-700 to-slate-900",
};

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const roleGradient = ROLE_COLORS[user?.role] || "from-blue-600 to-indigo-600";

  const navClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium relative
    ${isActive
      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
      : "text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-white"
    }`;

  const Item = ({ to, icon, label, end }) => {
    const Icon = ICONS[icon];
    return (
      <NavLink to={to} end={end} className={navClass}>
        {({ isActive }) => (
          <>
            {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full"></span>}
            <Icon size={16} className={isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600"} />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
<aside className="w-64 h-screen bg-white dark:bg-slate-800 shadow-lg flex flex-col transition-colors duration-300 border-r border-gray-100 dark:border-slate-700 overflow-y-auto flex-shrink-0">
      {/* Logo */}
      <div className={`p-5 bg-gradient-to-br ${roleGradient} text-white`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <FaIndustry size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">PIMS</h2>
            <p className="text-[10px] text-white/80 uppercase tracking-widest font-semibold">
              {user?.role?.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        {user?.profile_photo ? (
  <img
    src={`http://localhost:5000${user.profile_photo}`}
    alt="Profile"
    className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-white dark:border-slate-700"
  />
) : (
  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
    {user?.name?.[0]?.toUpperCase()}
  </div>
)}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main</p>
        <Item to="/" end icon="dashboard" label="Dashboard" />

        {user?.role === "shift_incharge" && (
          <Item to="/create-entry" icon="create" label="Create Entry" />
        )}

        {user?.role === "hod" && (
          <>
            <Item to="/hod-dashboard" icon="approve" label="HOD Approvals" />
            <Item to="/activity-log" icon="activity" label="Activity Log" />
          </>
        )}

        {user?.role === "superintendent" && (
          <>
            <Item to="/superintendent-dashboard" icon="approve" label="Superintendent Approvals" />
            <Item to="/activity-log" icon="activity" label="Activity Log" />
          </>
        )}

        {user?.role === "hr" && (
          <>
            <Item to="/hr-dashboard" icon="approve" label="HR Approvals" />
            <Item to="/reports-dashboard" icon="reports" label="Reports" />
            <Item to="/activity-log" icon="activity" label="Activity Log" />
          </>
        )}

        {user?.role === "admin" && (
          <>
            <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administration</p>
            <Item to="/reports-dashboard" icon="reports" label="Reports" />
            <Item to="/workers" icon="workers" label="Worker Management" />
            <Item to="/users" icon="users" label="User Management" />
            <Item to="/activity-log" icon="activity" label="Activity Log" />
          </>
        )}

        <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account</p>
        {user?.role !== "admin" && (
          <Item to="/change-password" icon="password" label="Change Password" />
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-700">
        <p className="text-[10px] text-gray-400 text-center">PIMS v1.0 — Universal Cables Ltd</p>
      </div>
    </aside>
  );
}