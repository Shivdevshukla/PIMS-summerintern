import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import api from "../api";
import { toast } from "react-toastify";
import {
  FaRupeeSign, FaClipboardList, FaCalendarAlt,
  FaIndustry, FaSyncAlt, FaFilePdf, FaSpinner,
  FaCheckCircle, FaUserCircle, FaChartLine,
  FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ── Skeleton shimmer ──────────────────────────────────────────
function Shimmer({ h = 16, w = "100%", className = "" }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse ${className}`}
      style={{ height: h, width: w }}
    />
  );
}

// ── Stat card ─────────────────────────────────────────────────
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

// ── Payslip download button ───────────────────────────────────
function PayslipBtn({ entryId, ocNumber }) {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payslip/${entryId}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-OC${ocNumber}-${entryId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Payslip OC #${ocNumber} downloaded`);
    } catch {
      toast.error("Failed to download payslip");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={download}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg
        bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40
        text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800
        transition-colors disabled:opacity-60"
    >
      {loading
        ? <FaSpinner size={10} className="animate-spin" />
        : <FaFilePdf size={10} />}
      {loading ? "…" : "PDF"}
    </button>
  );
}

// ── Monthly Payslip download button ──────────────────────────
function MonthlyPayslipBtn({ month, monthLabel }) {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payslip/monthly/${month}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${monthLabel.replace(/ /g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Payslip for ${monthLabel} downloaded`);
    } catch {
      toast.error("Failed to download monthly payslip");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={download}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg
        bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40
        text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800
        transition-colors disabled:opacity-60"
    >
      {loading ? <FaSpinner size={10} className="animate-spin" /> : <FaFilePdf size={10} />}
      {loading ? "…" : "PDF"}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function WorkerPortal() {
  const { user } = useSelector((s) => s.auth);

  const [profile,    setProfile]    = useState(null);
  const [entries,    setEntries]    = useState([]);
  const [summary,    setSummary]    = useState({ monthly: [], totals: null });
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthFilter, setMonthFilter] = useState(""); // "YYYY-MM" or ""
  const [sortDir,    setSortDir]    = useState("desc");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadEntries(); }, [monthFilter]);

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [profRes, sumRes] = await Promise.all([
        api.get("/worker-portal/profile"),
        api.get("/worker-portal/summary"),
      ]);
      setProfile(profRes.data);
      setSummary(sumRes.data);
      await loadEntries();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load portal data");
    }
    setLoading(false);
    setRefreshing(false);
  };

  const loadEntries = async () => {
    try {
      const params = monthFilter ? `?month=${monthFilter}` : "";
      const res = await api.get(`/worker-portal/entries${params}`);
      setEntries(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load entries");
    }
  };

  // Build last 6 months for the chart
  const chartData = useMemo(() => {
    const last6 = summary.monthly.slice(0, 6).reverse();
    return {
      labels: last6.map(m => m.month_label),
      datasets: [{
        label: "Incentive (₹)",
        data: last6.map(m => Number(m.total_incentive)),
        backgroundColor: "#3b82f6",
        borderRadius: 8,
      }],
    };
  }, [summary.monthly]);

  const sortedEntries = [...entries].sort((a, b) => {
    const da = new Date(a.shift_date), db = new Date(b.shift_date);
    return sortDir === "desc" ? db - da : da - db;
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Shimmer h={32} w="40%" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow space-y-3">
              <Shimmer h={12} w="50%" />
              <Shimmer h={28} w="60%" />
              <Shimmer h={10} w="35%" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5">
          <Shimmer h={200} />
        </div>
      </div>
    );
  }

  const totals = summary.totals || {};

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            My Incentive Portal
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View your approved production entries and download payslips
          </p>
        </div>
        <button
          onClick={() => loadAll(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm font-medium"
        >
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} size={13} />
          Refresh
        </button>
      </div>

      {/* ── Profile banner ── */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <FaUserCircle size={36} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-emerald-100 text-sm mt-0.5">
              {profile?.designation || "Worker"} · {profile?.department || "Production"} · Code: <span className="font-semibold">{profile?.code || "—"}</span>
            </p>
          </div>
          {totals.last_shift_date && (
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-emerald-100 text-xs">Last shift</p>
              <p className="font-semibold text-sm">
                {new Date(totals.last_shift_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Lifetime stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FaClipboardList} label="Total Entries" color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
          value={totals.total_entries ?? 0}
          sub="All approved entries"
        />
        <StatCard
          icon={FaRupeeSign} label="Total Incentive Earned" color="text-green-600"
          bg="bg-green-50 dark:bg-green-900/20"
          value={`₹${Number(totals.total_incentive || 0).toLocaleString("en-IN")}`}
          sub="Lifetime approved amount"
        />
        <StatCard
          icon={FaIndustry} label="Total Production" color="text-indigo-600"
          bg="bg-indigo-50 dark:bg-indigo-900/20"
          value={Number(totals.total_qty || 0).toLocaleString("en-IN")}
          sub="Units across all entries"
        />
        <StatCard
          icon={FaCalendarAlt} label="Active Months" color="text-purple-600"
          bg="bg-purple-50 dark:bg-purple-900/20"
          value={summary.monthly.length}
          sub="Months with incentive"
        />
      </div>

      {/* ── Monthly incentive chart ── */}
      {summary.monthly.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-blue-600 opacity-70" size={14} />
            <h2 className="text-sm font-bold text-gray-800 dark:text-white">Monthly Incentive (Last 6 Months)</h2>
          </div>
          <div className="h-52">
            <Bar
              data={chartData}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                  y: {
                    grid: { color: "#f1f5f9" },
                    ticks: {
                      font: { size: 11 },
                      callback: v => `₹${(v / 1000).toFixed(0)}k`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* ── Monthly summary table ── */}
      {summary.monthly.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-sm font-bold text-gray-800 dark:text-white">Month-by-Month Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-5 py-3 font-semibold">Month</th>
                  <th className="px-5 py-3 font-semibold">Entries</th>
                  <th className="px-5 py-3 font-semibold">Production</th>
                  <th className="px-5 py-3 font-semibold">Incentive Earned</th>
                  <th className="px-5 py-3 font-semibold">Payslip</th>
                </tr>
              </thead>
              <tbody>
                {summary.monthly.map(m => (
                  <tr key={m.month} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-white">{m.month_label}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{m.entry_count}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{Number(m.total_qty).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 font-bold text-green-700 dark:text-green-400">
                      ₹{Number(m.total_incentive).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3">
                      <MonthlyPayslipBtn month={m.month} monthLabel={m.month_label} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Entries table ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow">

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 flex-wrap gap-3">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">
            My Approved Entries
            <span className="ml-2 text-xs font-normal text-gray-400">({sortedEntries.length})</span>
          </h2>
          <div className="flex gap-2 items-center">
            {/* Month filter */}
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-xs px-3 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All months</option>
              {last12Months.map(m => (
                <option key={m} value={m}>
                  {new Date(m + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </option>
              ))}
            </select>

            {/* Sort toggle */}
            <button
              onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Date {sortDir === "desc" ? <FaChevronDown size={9} /> : <FaChevronUp size={9} />}
            </button>
          </div>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-gray-50 dark:divide-slate-700/50">
          {sortedEntries.length > 0 ? sortedEntries.map(e => (
            <div key={e.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">OC #{e.oc_number}</p>
                  <p className="text-xs text-gray-400">{e.machine_id} · {e.dept_section}</p>
                </div>
                <PayslipBtn entryId={e.id} ocNumber={e.oc_number} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                <div>
                  <p className="text-[10px] text-gray-400">Shift</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{e.shift} — {new Date(e.shift_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Incentive</p>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">₹{Number(e.incentive_amount).toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-400">
              <FaClipboardList size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No approved entries{monthFilter ? " for this month" : ""}</p>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                {["OC Number", "Machine / Dept", "Shift", "Date", "Production", "Incentive", "Payslip"].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedEntries.length > 0 ? sortedEntries.map(e => (
                <tr key={e.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-emerald-50/30 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-800 dark:text-white">#{e.oc_number}</p>
                    <p className="text-[10px] text-gray-400">{e.oc_stage} · {e.oc_type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{e.machine_id}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{e.dept_section}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      {e.shift}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{e.working_hours}h</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {new Date(e.shift_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {Number(e.production_quantity).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">
                    ₹{Number(e.incentive_amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <PayslipBtn entryId={e.id} ocNumber={e.oc_number} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-14">
                    <FaClipboardList size={26} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">
                      No approved entries{monthFilter ? " for this month" : ""}
                    </p>
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