import { useEffect, useState } from "react";
import api from "../api";
import {
  FaHistory, FaSearch, FaSyncAlt, FaCheckCircle, FaTimesCircle,
  FaPaperPlane, FaFilter, FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import { SkeletonTable } from "../components/Skeleton";

const ACTION_CONFIG = {
  submitted: {
    label: "Submitted",
    icon: FaPaperPlane,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    dot: "bg-blue-500",
  },
  approved: {
    label: "Approved",
    icon: FaCheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    icon: FaTimesCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
};

const ROLE_LABEL = {
  shift_incharge:  "Shift Incharge",
  hod:             "HOD",
  superintendent:  "Superintendent",
  hr:              "HR",
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Group logs by entry_id for the timeline view
function groupByEntry(logs) {
  const map = {};
  logs.forEach(log => {
    if (!map[log.entry_id]) {
      map[log.entry_id] = {
        entry_id:    log.entry_id,
        oc_number:   log.oc_number,
        dept:        log.dept_section,
        machine:     log.machine_id,
        workers:     log.worker_name,
        events:      [],
      };
    }
    map[log.entry_id].events.push(log);
  });
  return Object.values(map);
}

function EntryTimeline({ group, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const lastEvent = group.events[group.events.length - 1];
  const cfg = ACTION_CONFIG[lastEvent?.action] || ACTION_CONFIG.submitted;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-gray-100 dark:border-slate-700 overflow-hidden">

      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="font-semibold text-sm text-gray-800 dark:text-white">
            OC #{group.oc_number}
          </span>
          <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[180px]">
            {group.machine} · {group.dept}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-gray-400">{group.events.length} event{group.events.length > 1 ? "s" : ""}</span>
          {open ? <FaChevronUp size={11} className="text-gray-400" /> : <FaChevronDown size={11} className="text-gray-400" />}
        </div>
      </button>

      {/* Timeline */}
      {open && (
        <div className="border-t border-gray-100 dark:border-slate-700 px-5 py-4">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-200 dark:bg-slate-600" />

            <div className="space-y-4">
              {group.events.map((ev, i) => {
                const evCfg = ACTION_CONFIG[ev.action] || ACTION_CONFIG.submitted;
                const EvIcon = evCfg.icon;
                const isLast = i === group.events.length - 1;
                return (
                  <div key={ev.id} className="flex gap-4 relative">
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${evCfg.bg}`}>
                      <EvIcon className={evCfg.color} size={12} />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 pb-1 ${!isLast ? "border-none" : ""}`}>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {ev.actor_name}
                            <span className="ml-1.5 text-[10px] font-normal text-gray-400">
                              ({ROLE_LABEL[ev.actor_role] || ev.actor_role})
                            </span>
                          </p>
                          <p className={`text-xs font-medium mt-0.5 ${evCfg.color}`}>
                            {evCfg.label}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {timeAgo(ev.created_at)}
                          <br />
                          <span className="opacity-70">
                            {new Date(ev.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </span>
                      </div>

                      {/* Status transition */}
                      {ev.from_status && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                            {ev.from_status.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-gray-400">→</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${evCfg.bg} ${evCfg.color}`}>
                            {ev.to_status.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}

                      {/* Remarks */}
                      {ev.remarks && (
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-1.5 italic">
                          "{ev.remarks}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [viewMode, setViewMode] = useState("timeline"); // 'timeline' | 'table'

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get("/audit");
      setLogs(res.data);
    } catch (err) {
      console.error("Audit log error:", err);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const filtered = logs.filter(log => {
    const actionOk = filterAction === "all" || log.action === filterAction;
    const roleOk   = filterRole   === "all" || log.actor_role === filterRole;
    const searchOk = !search ||
      log.oc_number?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.dept_section?.toLowerCase().includes(search.toLowerCase()) ||
      log.machine_id?.toLowerCase().includes(search.toLowerCase()) ||
      (log.remarks || "").toLowerCase().includes(search.toLowerCase());
    return actionOk && roleOk && searchOk;
  });

  const grouped = groupByEntry(filtered);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        <SkeletonTable rows={7} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            Activity Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete audit trail of every status change across all entries
          </p>
        </div>
        <button
          onClick={() => loadLogs(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm font-medium"
        >
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} size={13} />
          Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Events", value: logs.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Approved", value: logs.filter(l => l.action === "approved").length, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Rejected", value: logs.filter(l => l.action === "rejected").length, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl p-4 ${bg}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow px-4 py-3 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search OC, actor, machine, remarks…"
            className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Action filter */}
        <div className="flex items-center gap-2">
          <FaFilter size={11} className="text-gray-400" />
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-1.5 rounded-xl outline-none"
          >
            <option value="all">All actions</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Role filter */}
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-1.5 rounded-xl outline-none"
        >
          <option value="all">All roles</option>
          <option value="shift_incharge">Shift Incharge</option>
          <option value="hod">HOD</option>
          <option value="superintendent">Superintendent</option>
          <option value="hr">HR</option>
        </select>

        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-medium">
          {["timeline", "table"].map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                viewMode === v
                  ? "bg-white dark:bg-slate-600 text-blue-700 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
          {filtered.length} events · {grouped.length} entries
        </span>
      </div>

      {/* ── Timeline view ── */}
      {viewMode === "timeline" && (
        <div className="space-y-3">
          {grouped.length > 0 ? (
            grouped.map((g, i) => (
              <EntryTimeline key={g.entry_id} group={g} defaultOpen={i === 0} />
            ))
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-16 text-center">
              <FaHistory size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400 dark:text-gray-500">No events match the current filters</p>
            </div>
          )}
        </div>
      )}

      {/* ── Table view ── */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                {["OC Number", "Actor", "Role", "Action", "Status Change", "Remarks", "Time"].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(log => {
                const cfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.submitted;
                const Icon = cfg.icon;
                return (
                  <tr key={log.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-400">#{log.oc_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs text-gray-800 dark:text-white">{log.actor_name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{ROLE_LABEL[log.actor_role] || log.actor_role}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                        <Icon size={9} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.from_status ? (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {log.from_status.replace(/_/g, " ")} → {log.to_status.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className={`text-[10px] ${cfg.color}`}>{log.to_status.replace(/_/g, " ")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{log.remarks || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      <br />
                      {new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="text-center py-14">
                    <FaHistory size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No events match the current filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}