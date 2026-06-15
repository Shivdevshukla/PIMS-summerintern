import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";
import {
  FaCheckCircle, FaTimesCircle, FaSyncAlt, FaSearch,
  FaChevronDown, FaChevronUp, FaClipboardList,
  FaIndustry, FaUsers, FaRupeeSign, FaClock, FaTimes,
} from "react-icons/fa";

// ── Confirmation Modal ──────────────────────────────────────────────────────
function ConfirmModal({ entry, action, remarks, setRemarks, qty, setQty, onConfirm, onCancel, loading }) {
  const isApprove = action === "approve";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isApprove ? "bg-green-100" : "bg-red-100"}`}>
              {isApprove
                ? <FaCheckCircle className="text-green-600" size={18} />
                : <FaTimesCircle className="text-red-600" size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {isApprove ? "Approve Entry" : "Reject Entry"}
              </h3>
              <p className="text-xs text-gray-400">OC #{entry.oc_number}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <FaTimes size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {isApprove && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Confirmed Production Quantity
              </label>
              <input
                type="number"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">You can adjust the quantity before approving</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Remarks {!isApprove && <span className="text-red-400">*</span>}
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder={isApprove ? "Optional remarks…" : "Reason for rejection (required)"}
              className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm focus:ring-2 outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || (!isApprove && !remarks.trim())}
            className={`flex-1 py-2.5 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60
              ${isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {loading ? "Processing…" : isApprove ? "✓ Approve" : "✕ Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Entry Detail Drawer ─────────────────────────────────────────────────────
function EntryDetail({ entry, onClose }) {
  const rows = [
    ["OC Number", `#${entry.oc_number}`],
    ["OC Stage", entry.oc_stage],
    ["OC Type", entry.oc_type],
    ["Machine ID", entry.machine_id],
    ["Department", entry.dept_section],
    ["Shift", entry.shift],
    ["Shift Date", new Date(entry.shift_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
    ["Working Hours", `${entry.working_hours} hrs`],
    ["Production Qty", entry.production_quantity],
    ["Raw Material", `${entry.raw_material_used ?? 0} kg`],
    ["Incentive", `₹${Number(entry.incentive_amount).toLocaleString("en-IN")}`],
    ["Submitted By", entry.submitted_by_name || "—"],
    ["Workers", entry.worker_name || "—"],
    ["Remarks", entry.remarks || "—"],
  ];
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 w-full max-w-sm shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Entry Details</h3>
            <p className="text-xs text-gray-400">OC #{entry.oc_number}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            <FaTimes size={16} />
          </button>
        </div>
        <div className="p-5 space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">{label}</span>
              <span className="text-xs text-gray-900 dark:text-white font-semibold text-right break-words max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main HOD Dashboard ──────────────────────────────────────────────────────
export default function HODDashboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const [modal, setModal] = useState(null); // { entry, action }
  const [modalRemarks, setModalRemarks] = useState("");
  const [modalQty, setModalQty] = useState("");
  const [detailEntry, setDetailEntry] = useState(null);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get("/entries");
      setEntries(res.data);
    } catch {
      toast.error("Failed to load entries");
    }
    setLoading(false);
    setRefreshing(false);
  };

  const openModal = (entry, action) => {
    setModal({ entry, action });
    setModalRemarks(action === "approve" ? "Approved by HOD" : "");
    setModalQty(String(entry.production_quantity));
  };

  const closeModal = () => {
    setModal(null);
    setModalRemarks("");
    setModalQty("");
  };

  const handleConfirm = async () => {
    if (!modal) return;
    const { entry, action } = modal;

    if (action === "reject" && !modalRemarks.trim()) {
      toast.warning("Please enter a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/approvals/hod/${entry.id}`, {
        action,
        remarks: modalRemarks || (action === "approve" ? "Approved by HOD" : "Rejected by HOD"),
        production_quantity: Number(modalQty) || entry.production_quantity,
      });

      toast.success(action === "approve" ? "Entry approved — moved to Superintendent" : "Entry rejected");
      closeModal();
      loadEntries();
    } catch {
      toast.error(action === "approve" ? "Approval failed" : "Rejection failed");
    }
    setActionLoading(false);
  };

  // ── Sorting ──
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FaChevronDown className="opacity-30" size={10} />;
    return sortDir === "asc" ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />;
  };

  const sorted = [...entries]
    .filter(e =>
      !search ||
      e.oc_number?.toLowerCase().includes(search.toLowerCase()) ||
      e.machine_id?.toLowerCase().includes(search.toLowerCase()) ||
      e.worker_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.dept_section?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let va = a[sortField] ?? "";
      let vb = b[sortField] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalIncentive = entries.reduce((s, e) => s + Number(e.incentive_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading entries…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Confirm Modal ── */}
      {modal && (
        <ConfirmModal
          entry={modal.entry}
          action={modal.action}
          remarks={modalRemarks}
          setRemarks={setModalRemarks}
          qty={modalQty}
          setQty={setModalQty}
          onConfirm={handleConfirm}
          onCancel={closeModal}
          loading={actionLoading}
        />
      )}

      {/* ── Detail Drawer ── */}
      {detailEntry && (
        <EntryDetail entry={detailEntry} onClose={() => setDetailEntry(null)} />
      )}

      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              HOD Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review and approve production entries before they reach the Superintendent
            </p>
          </div>
          <button
            onClick={() => loadEntries(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm font-medium"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} size={13} />
            Refresh
          </button>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: FaClipboardList, label: "Pending Review", value: entries.length, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
            { icon: FaRupeeSign, label: "Total Incentive", value: `₹${totalIncentive.toLocaleString("en-IN")}`, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
            { icon: FaClock, label: "Oldest Pending", value: entries.length > 0
                ? (() => {
                    const oldest = new Date(Math.min(...entries.map(e => new Date(e.created_at))));
                    const days = Math.floor((Date.now() - oldest) / 86400000);
                    return days === 0 ? "Today" : `${days}d ago`;
                  })()
                : "—",
              color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl p-4 ${bg} border border-transparent`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`${color} opacity-70`} size={13} />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow">

          {/* Table toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-700 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search OC, machine, worker…"
                className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              {sorted.length} of {entries.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                  {[
                    { label: "OC Number", field: "oc_number" },
                    { label: "Machine / Dept", field: "machine_id" },
                    { label: "Workers", field: "worker_name" },
                    { label: "Shift", field: "shift" },
                    { label: "Qty", field: "production_quantity" },
                    { label: "Incentive", field: "incentive_amount" },
                    { label: "Submitted", field: "created_at" },
                    { label: "Actions", field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => field && toggleSort(field)}
                      className={`px-4 py-3 font-semibold ${field ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none" : ""}`}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {field && <SortIcon field={field} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.length > 0 ? (
                  sorted.map(entry => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-blue-50/40 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailEntry(entry)}
                          className="font-bold text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          #{entry.oc_number}
                        </button>
                        <p className="text-[10px] text-gray-400 mt-0.5">{entry.oc_stage} · {entry.oc_type}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-white text-xs">{entry.machine_id}</p>
                        <p className="text-[10px] text-gray-400">{entry.dept_section}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[160px]">
                        <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{entry.worker_name || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          {entry.shift}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{entry.working_hours}h</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white text-xs">
                        {Number(entry.production_quantity).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400 text-xs">
                        ₹{Number(entry.incentive_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-gray-400">
                        {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        <br />
                        {new Date(entry.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openModal(entry, "approve")}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FaCheckCircle size={10} /> Approve
                          </button>
                          <button
                            onClick={() => openModal(entry, "reject")}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FaTimesCircle size={10} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-16">
                      <FaClipboardList size={28} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {search ? `No entries match "${search}"` : "No pending entries — all clear!"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}