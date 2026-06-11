import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { SkeletonCard, SkeletonTable } from "../components/Skeleton"; 
import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaMoneyBillWave,
  FaUserCircle,
  FaPlus,
  FaHourglassHalf,
  FaTimesCircle,
  FaChevronRight,
  FaSyncAlt,
} from "react-icons/fa";

const STATUS_CONFIG = {
  pending_hod: {
    label: "Pending HOD",
    color: "text-orange-600",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  pending_superintendent: {
    label: "Pending Supt.",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  pending_hr: {
    label: "Pending HR",
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  approved: {
    label: "Approved",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-900/30",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    dot: "bg-red-500",
  },
};

function StatCard({ icon: Icon, label, value, color, subLabel }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} bg-opacity-15`}>
          <Icon className={color} size={16} />
        </div>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
    </div>
  );
}

function WorkflowStep({ label, status, count }) {
  const isDone = count === 0;
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all
          ${isDone ? "bg-green-500" : "bg-yellow-400 animate-pulse"}`}
      >
        {isDone ? "✓" : count}
      </div>
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">{label}</p>
      <span className={`text-[10px] font-medium ${isDone ? "text-green-500" : "text-yellow-600 dark:text-yellow-400"}`}>
        {isDone ? "Done" : "Waiting"}
      </span>
    </div>
  );
}

function WorkflowConnector({ done }) {
  return (
    <div className={`flex-1 h-1 rounded hidden md:block transition-colors ${done ? "bg-green-400" : "bg-gray-200 dark:bg-slate-600"}`} />
  );
}

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEntries: 0,
    pendingHod: 0,
    pendingSuperintendent: 0,
    pendingHr: 0,
    approved: 0,
    totalIncentive: 0,
  });
  const [entries, setEntries] = useState([]);
   const [dateFilter, setDateFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const getDateRange = () => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split("T")[0];
    const monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split("T")[0];
    const map = {
      today: [today, today],
      week: [weekAgo, today],
      month: [monthAgo, today],
      all: ["", ""]
    };
    return map[dateFilter] || [customFrom, customTo];
  };
  const [filterStatus, setFilterStatus] = useState("all");

useEffect(() => {
  loadStats();
  loadRecentEntries();
}, [dateFilter, customFrom, customTo]); // ← ADD dateFilter, customFrom, customTo

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    await Promise.all([loadStats(), loadRecentEntries()]);
    setLoading(false);
    setRefreshing(false);
  };

  const loadStats = async () => {
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

 const loadRecentEntries = async () => {
  try {
    const [from, to] = getDateRange();
    const params = from && to ? `?from=${from}&to=${to}` : "";
    const r = await api.get(`/dashboard/recent${params}`);
    setEntries(r.data);
  } catch(e) {}
};
  const totalPending = stats.pendingHod + stats.pendingSuperintendent + stats.pendingHr;

  const filteredEntries =
    filterStatus === "all"
      ? entries
      : entries.filter((e) => e.status === filterStatus);

  if (loading) return (
  <div>
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[1,2,3,4].map(i => <SkeletonCard key={i}/>)}
    </div>
    <SkeletonTable rows={6} cols={8}/>
  </div>
);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            Shift Incharge Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Production Incentive Management — Overview
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm font-medium"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} size={13} />
            Refresh
          </button>

          <button
            onClick={() => navigate("/create-entry")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl shadow hover:bg-blue-800 transition-all text-sm font-semibold"
          >
            <FaPlus size={12} />
            New Entry
          </button>
        </div>
      </div>

{/* ← ADD THE FILTER BAR HERE, between header and welcome banner */}
    <div className="flex items-center gap-2 flex-wrap mb-6">
      {[["today","Today"],["week","This Week"],["month","This Month"],["all","All Time"]].map(([v,l]) => (
        <button key={v} onClick={() => setDateFilter(v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
            ${dateFilter === v
              ? "bg-blue-700 text-white"
              : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-blue-300"}`}>
          {l}
        </button>
      ))}
      <button onClick={() => setDateFilter("custom")}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
          ${dateFilter === "custom"
            ? "bg-blue-700 text-white border-blue-700"
            : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300"}`}>
        Custom Range
      </button>
      {dateFilter === "custom" && (
        <div className="flex items-center gap-2">
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
            className="border rounded-lg px-2 py-1 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none"/>
          <span className="text-gray-400 text-xs">to</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
            className="border rounded-lg px-2 py-1 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none"/>
        </div>
      )}
    </div>
    
      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <FaUserCircle size={38} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Welcome back, {user?.name}</h2>
            <p className="text-blue-100 text-sm mt-0.5">
              {user?.role?.replace("_", " ")} &nbsp;·&nbsp; {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          {totalPending > 0 && (
            <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full hidden sm:block">
              {totalPending} entries in pipeline
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FaClipboardList}
          label="Total Entries"
          value={stats.totalEntries}
          color="text-blue-600"
          subLabel="All time"
        />
        <StatCard
          icon={FaHourglassHalf}
          label="In Pipeline"
          value={totalPending}
          color="text-yellow-600"
          subLabel="Awaiting approval"
        />
        <StatCard
          icon={FaCheckCircle}
          label="Approved"
          value={stats.approved}
          color="text-green-600"
          subLabel="Fully processed"
        />
        <StatCard
          icon={FaMoneyBillWave}
          label="Total Incentive"
          value={`₹${Number(stats.totalIncentive).toLocaleString("en-IN")}`}
          color="text-indigo-600"
          subLabel="Cumulative amount"
        />
      </div>

      {/* ── Pending Breakdown ── */}
      {totalPending > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "pendingHod", label: "At HOD", icon: FaClock, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800" },
            { key: "pendingSuperintendent", label: "At Supt.", icon: FaClock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" },
            { key: "pendingHr", label: "At HR", icon: FaClock, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800" },
          ].map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} className={`rounded-xl p-4 ${bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`${color} opacity-70`} size={13} />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{stats[key]}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Approval Workflow ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-5">Approval Workflow</h2>
        <div className="flex items-center justify-between gap-2">
          <WorkflowStep label="Submitted" status="done" count={0} />
          <WorkflowConnector done={stats.pendingHod === 0} />
          <WorkflowStep label="HOD" count={stats.pendingHod} />
          <WorkflowConnector done={stats.pendingHod === 0 && stats.pendingSuperintendent === 0} />
          <WorkflowStep label="Supt." count={stats.pendingSuperintendent} />
          <WorkflowConnector done={stats.pendingHod === 0 && stats.pendingSuperintendent === 0 && stats.pendingHr === 0} />
          <WorkflowStep label="HR" count={stats.pendingHr} />
          <WorkflowConnector done={stats.approved > 0 && totalPending === 0} />
          <WorkflowStep label="Approved" count={0} />
        </div>
      </div>

      {/* ── Recent Entries ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700 flex-wrap gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Recent Production Entries</h2>

          {/* Status filter tabs */}
          <div className="flex gap-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
            {["all", "pending_hod", "approved"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                  filterStatus === s
                    ? "bg-white dark:bg-slate-600 text-blue-700 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s]?.label ?? s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                <th className="px-5 py-3 font-semibold">OC Number</th>
                <th className="px-5 py-3 font-semibold">Machine</th>
                <th className="px-5 py-3 font-semibold">Workers</th>
                <th className="px-5 py-3 font-semibold">Incentive</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => {
                  const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.pending_hod;
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-white">
                        #{entry.oc_number}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                        {entry.machine_id}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 max-w-[160px] truncate">
                        {entry.worker_name || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-green-700 dark:text-green-400">
                        ₹{Number(entry.incentive_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(entry.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <FaClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No entries found</p>
                    <button
                      onClick={() => navigate("/create-entry")}
                      className="mt-3 text-blue-600 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Create your first entry <FaChevronRight size={10} />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}