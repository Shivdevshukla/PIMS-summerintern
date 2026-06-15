import { useEffect, useState, useMemo } from "react";
import api from "../api";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  FaFileExcel, FaSyncAlt, FaCheckCircle, FaTimesCircle,
  FaHourglassHalf, FaRupeeSign, FaClipboardList, FaIndustry,
  FaChartBar, FaChartPie, FaChartLine, FaUsers,
} from "react-icons/fa";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement
);

const CHART_COLORS = {
  blue:   { bg: "#3b82f6", border: "#2563eb" },
  green:  { bg: "#22c55e", border: "#16a34a" },
  red:    { bg: "#ef4444", border: "#dc2626" },
  yellow: { bg: "#f59e0b", border: "#d97706" },
  purple: { bg: "#8b5cf6", border: "#7c3aed" },
  indigo: { bg: "#6366f1", border: "#4f46e5" },
};

const MONTH_ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const BAR_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
  },
};

const LINE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
  },
  elements: { line: { tension: 0.4 } },
};

const PIE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom", labels: { font: { size: 12 }, padding: 16 } } },
};

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className={`rounded-2xl p-5 ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`${color} opacity-70`} size={14} />
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-blue-600 opacity-70" size={14} />
        <h2 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function ReportsDashboard() {
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadReports(); }, []);

  const loadReports = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get("/entries/all/reports");
      setAllEntries(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setRefreshing(false);
  };

  // Unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(allEntries.map(e => e.dept_section).filter(Boolean))].sort();
    return depts;
  }, [allEntries]);

  // Filtered entries
  const entries = useMemo(() => {
    return allEntries.filter(e => {
      const deptOk = filterDept === "all" || e.dept_section === filterDept;
      const statusOk = filterStatus === "all" || e.status === filterStatus;
      return deptOk && statusOk;
    });
  }, [allEntries, filterDept, filterStatus]);

  // Computed stats
  const stats = useMemo(() => {
    const approved  = entries.filter(e => e.status === "approved").length;
    const rejected  = entries.filter(e => e.status === "rejected").length;
    const pending   = entries.filter(e => e.status.startsWith("pending")).length;
    const incentive = entries.reduce((s, e) => s + Number(e.incentive_amount || 0), 0);
    const approvedIncentive = entries
      .filter(e => e.status === "approved")
      .reduce((s, e) => s + Number(e.incentive_amount || 0), 0);
    const approvalRate = entries.length > 0 ? ((approved / entries.length) * 100).toFixed(1) : "0";
    const totalQty = entries.reduce((s, e) => s + Number(e.production_quantity || 0), 0);
    return { total: entries.length, approved, rejected, pending, incentive, approvedIncentive, approvalRate, totalQty };
  }, [entries]);

  // Monthly entries (sorted correctly)
  const monthlyData = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const m = new Date(e.created_at).toLocaleString("default", { month: "short" });
      map[m] = (map[m] || 0) + 1;
    });
    const labels = MONTH_ORDER.filter(m => map[m]);
    return { labels, values: labels.map(m => map[m]) };
  }, [entries]);

  // Monthly incentive (approved only)
  const monthlyIncentive = useMemo(() => {
    const map = {};
    entries.filter(e => e.status === "approved").forEach(e => {
      const m = new Date(e.created_at).toLocaleString("default", { month: "short" });
      map[m] = (map[m] || 0) + Number(e.incentive_amount || 0);
    });
    const labels = MONTH_ORDER.filter(m => map[m]);
    return { labels, values: labels.map(m => map[m]) };
  }, [entries]);

  // Dept-wise incentive
  const deptIncentive = useMemo(() => {
    const map = {};
    entries.filter(e => e.status === "approved").forEach(e => {
      const d = e.dept_section || "Unknown";
      map[d] = (map[d] || 0) + Number(e.incentive_amount || 0);
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { labels: sorted.map(x => x[0]), values: sorted.map(x => x[1]) };
  }, [entries]);

  // Top machines
  const topMachines = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const m = e.machine_id || "Unknown";
      if (!map[m]) map[m] = { qty: 0, entries: 0, incentive: 0 };
      map[m].qty += Number(e.production_quantity || 0);
      map[m].entries += 1;
      map[m].incentive += Number(e.incentive_amount || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 8)
      .map(([machine, data]) => ({ machine, ...data }));
  }, [entries]);

  const exportExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get("/export/excel", { responseType: "blob" });
      const url = URL.createObjectURL(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "PIMS-Production-Report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading reports…</p>
        </div>
      </div>
    );
  }

  const pending = stats.total - stats.approved - stats.rejected;

  return (
    <div className="space-y-6 text-gray-900 dark:text-white">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            Reports Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Production incentive analytics across all departments
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => loadReports(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm font-medium"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} size={13} />
            Refresh
          </button>
          <button
            onClick={exportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white rounded-xl shadow text-sm font-semibold transition-colors"
          >
            <FaFileExcel size={14} />
            {exporting ? "Exporting…" : "Export Excel"}
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</label>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending_hod">Pending HOD</option>
            <option value="pending_superintendent">Pending Superintendent</option>
            <option value="pending_hr">Pending HR</option>
          </select>
        </div>
        {(filterDept !== "all" || filterStatus !== "all") && (
          <button
            onClick={() => { setFilterDept("all"); setFilterStatus("all"); }}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FaClipboardList} label="Total Entries" value={stats.total}
          color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" sub={`${stats.approvalRate}% approval rate`} />
        <StatCard icon={FaCheckCircle} label="Approved" value={stats.approved}
          color="text-green-600" bg="bg-green-50 dark:bg-green-900/20"
          sub={`₹${stats.approvedIncentive.toLocaleString("en-IN")} released`} />
        <StatCard icon={FaTimesCircle} label="Rejected" value={stats.rejected}
          color="text-red-600" bg="bg-red-50 dark:bg-red-900/20" />
        <StatCard icon={FaHourglassHalf} label="In Pipeline" value={pending}
          color="text-yellow-600" bg="bg-yellow-50 dark:bg-yellow-900/20" sub="awaiting approval" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={FaRupeeSign} label="Total Incentive Pool" value={`₹${stats.incentive.toLocaleString("en-IN")}`}
          color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" sub="all entries, all statuses" />
        <StatCard icon={FaIndustry} label="Total Production" value={stats.totalQty.toLocaleString("en-IN")}
          color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" sub="units across filtered entries" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        <ChartCard title="Approval Distribution" icon={FaChartPie}>
          <div className="h-72">
            <Pie
              data={{
                labels: ["Approved", "Rejected", "Pending"],
                datasets: [{
                  data: [stats.approved, stats.rejected, pending],
                  backgroundColor: [CHART_COLORS.green.bg, CHART_COLORS.red.bg, CHART_COLORS.yellow.bg],
                  borderColor: [CHART_COLORS.green.border, CHART_COLORS.red.border, CHART_COLORS.yellow.border],
                  borderWidth: 2,
                }],
              }}
              options={PIE_OPTS}
            />
          </div>
        </ChartCard>

        <ChartCard title="Monthly Production Entries" icon={FaChartLine}>
          <div className="h-72">
            <Line
              data={{
                labels: monthlyData.labels,
                datasets: [{
                  label: "Entries",
                  data: monthlyData.values,
                  backgroundColor: CHART_COLORS.blue.bg + "33",
                  borderColor: CHART_COLORS.blue.border,
                  borderWidth: 2,
                  pointBackgroundColor: CHART_COLORS.blue.border,
                  fill: true,
                }],
              }}
              options={LINE_OPTS}
            />
          </div>
        </ChartCard>

      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        <ChartCard title="Monthly Incentive Released (₹)" icon={FaRupeeSign}>
          <div className="h-72">
            <Bar
              data={{
                labels: monthlyIncentive.labels,
                datasets: [{
                  label: "Incentive (₹)",
                  data: monthlyIncentive.values,
                  backgroundColor: CHART_COLORS.green.bg,
                  borderRadius: 8,
                }],
              }}
              options={{
                ...BAR_OPTS,
                scales: {
                  ...BAR_OPTS.scales,
                  y: {
                    ...BAR_OPTS.scales.y,
                    ticks: {
                      callback: v => `₹${(v / 1000).toFixed(0)}k`,
                      font: { size: 11 },
                    },
                  },
                },
              }}
            />
          </div>
        </ChartCard>

        <ChartCard title="Department-wise Incentive (₹)" icon={FaChartBar}>
          <div className="h-72">
            <Bar
              data={{
                labels: deptIncentive.labels,
                datasets: [{
                  label: "Incentive (₹)",
                  data: deptIncentive.values,
                  backgroundColor: CHART_COLORS.purple.bg,
                  borderRadius: 8,
                }],
              }}
              options={{
                ...BAR_OPTS,
                indexAxis: "y",
                scales: {
                  x: {
                    grid: { color: "#f1f5f9" },
                    ticks: { callback: v => `₹${(v / 1000).toFixed(0)}k`, font: { size: 10 } },
                  },
                  y: { grid: { display: false }, ticks: { font: { size: 10 } } },
                },
              }}
            />
          </div>
        </ChartCard>

      </div>

      {/* ── Top Machines Table ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <FaIndustry className="text-blue-600 opacity-70" size={14} />
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">Top Machines by Production</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">Machine ID</th>
                <th className="px-5 py-3 font-semibold">Total Entries</th>
                <th className="px-5 py-3 font-semibold">Production Qty</th>
                <th className="px-5 py-3 font-semibold">Total Incentive</th>
                <th className="px-5 py-3 font-semibold">Qty Share</th>
              </tr>
            </thead>
            <tbody>
              {topMachines.length > 0 ? topMachines.map((m, i) => {
                const pct = stats.totalQty > 0 ? ((m.qty / stats.totalQty) * 100).toFixed(1) : 0;
                return (
                  <tr key={m.machine} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-5 py-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800 dark:text-white">{m.machine}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{m.entries}</td>
                    <td className="px-5 py-3 font-semibold text-indigo-600 dark:text-indigo-400">{m.qty.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 font-semibold text-green-600 dark:text-green-400">₹{m.incentive.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 max-w-[80px]">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400 text-sm">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}