import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";
import {
  FaCheckCircle, FaTimesCircle, FaSyncAlt, FaSearch,
  FaChevronDown, FaChevronUp, FaClipboardList,
  FaRupeeSign, FaClock, FaTimes, FaCommentAlt,
  FaUsers, FaShieldAlt, FaEdit,
} from "react-icons/fa";

// ── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ entry, action, remarks, setRemarks, incentive, setIncentive, onConfirm, onCancel, loading }) {
  const isApprove = action === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isApprove ? "bg-green-100" : "bg-red-100"}`}>
              {isApprove
                ? <FaShieldAlt className="text-green-600" size={16} />
                : <FaTimesCircle className="text-red-600" size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {isApprove ? "Final Approval — Release Incentive" : "Reject Entry"}
              </h3>
              <p className="text-xs text-gray-400">OC #{entry.oc_number} · {entry.dept_section}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Approval chain summary */}
        {isApprove && (
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 mb-4 space-y-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Approval Chain</p>
            {[
              { label: "Shift Incharge", note: entry.submitted_by_name || "—" },
              { label: "HOD", note: entry.hod_remarks || "Approved" },
              { label: "Superintendent", note: entry.superintendent_remarks || "Approved" },
            ].map(({ label, note }) => (
              <div key={label} className="flex items-start gap-2 text-xs">
                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" size={11} />
                <span className="text-gray-500 dark:text-gray-400 shrink-0 w-28">{label}</span>
                <span className="text-gray-700 dark:text-gray-300 truncate">{note}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {isApprove && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Final Incentive Amount (₹)
              </label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" size={12} />
                <input
                  type="number"
                  value={incentive}
                  onChange={e => setIncentive(e.target.value)}
                  className="w-full pl-7 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none font-bold"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Original: ₹{Number(entry.incentive_amount).toLocaleString("en-IN")} — adjust if needed before final release
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              HR Remarks {!isApprove && <span className="text-red-400">*</span>}
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder={isApprove ? "Optional remarks for records…" : "Reason for rejection (required)"}
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
            {loading ? "Processing…" : isApprove ? "✓ Final Approve" : "✕ Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Entry Detail Drawer ──────────────────────────────────────────────────────
function EntryDetail({ entry, onClose, onApprove, onReject }) {
  const rows = [
    ["OC Number", `#${entry.oc_number}`],
    ["OC Stage", entry.oc_stage],
    ["OC Type", entry.oc_type],
    ["Machine ID", entry.machine_id],
    ["Department", entry.dept_section],
    ["Shift", `${entry.shift} (${entry.working_hours} hrs)`],
    ["Shift Date", new Date(entry.shift_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
    ["Production Qty", Number(entry.production_quantity).toLocaleString("en-IN")],
    ["Raw Material", `${entry.raw_material_used ?? 0} kg`],
    ["Workers", entry.worker_name || "—"],
    ["Submitted By", entry.submitted_by_name || "—"],
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 w-full max-w-sm shadow-2xl flex flex-col overflow-hidden">

        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Entry Details</h3>
            <p className="text-xs text-gray-400">OC #{entry.oc_number}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            <FaTimes size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-1.5">

          {/* Incentive highlight */}
          <div className="bg-green-600 text-white rounded-xl px-4 py-3 mb-4">
            <p className="text-green-200 text-xs mb-0.5">Incentive to Release</p>
            <p className="text-2xl font-bold">₹{Number(entry.incentive_amount).toLocaleString("en-IN")}</p>
          </div>

          {/* Entry fields */}
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">{label}</span>
              <span className="text-xs text-gray-900 dark:text-white font-semibold text-right break-words max-w-[60%]">{value}</span>
            </div>
          ))}

          {/* Approval trail */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Approval Trail</p>
            {[
              { stage: "HOD", remarks: entry.hod_remarks },
              { stage: "Superintendent", remarks: entry.superintendent_remarks },
            ].map(({ stage, remarks }) => (
              <div key={stage} className="flex items-start gap-2.5 mb-3">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <FaCheckCircle size={9} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{stage}</p>
                  <p className="text-[10px] text-gray-400">{remarks || "Approved"}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-yellow-400 text-white flex items-center justify-center shrink-0 mt-0.5">
                <FaClock size={8} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">HR</p>
                <p className="text-[10px] text-gray-400">Awaiting your review</p>
              </div>
            </div>
          </div>

          {/* Shift remarks */}
          {entry.remarks && (
            <div className="mt-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Shift Remarks</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{entry.remarks}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700 px-5 py-4 flex gap-3 bg-white dark:bg-slate-800">
          <button
            onClick={() => { onClose(); onReject(entry); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <FaTimesCircle size={12} /> Reject
          </button>
          <button
            onClick={() => { onClose(); onApprove(entry); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            <FaShieldAlt size={12} /> Final Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function HRDashboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const [modal, setModal] = useState(null);
  const [modalRemarks, setModalRemarks] = useState("");
  const [modalIncentive, setModalIncentive] = useState("");
  const [detailEntry, setDetailEntry] = useState(null);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get("/entries");
      setEntries(res.data.filter(e => e.status === "pending_hr"));
    } catch {
      toast.error("Failed to load entries");
    }
    setLoading(false);
    setRefreshing(false);
  };

  const openModal = (entry, action) => {
    setModal({ entry, action });
    setModalRemarks(action === "approve" ? "Approved by HR" : "");
    setModalIncentive(String(entry.incentive_amount));
  };

  const closeModal = () => {
    setModal(null);
    setModalRemarks("");
    setModalIncentive("");
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
      await api.put(`/approvals/hr/${entry.id}`, {
        action,
        remarks: modalRemarks || (action === "approve" ? "Approved by HR" : "Rejected by HR"),
        incentive_amount: Number(modalIncentive) || entry.incentive_amount,
      });

      toast.success(
        action === "approve"
          ? `Incentive of ₹${Number(modalIncentive).toLocaleString("en-IN")} released successfully!`
          : "Entry rejected"
      );
      closeModal();
      loadEntries();
    } catch {
      toast.error(action === "approve" ? "Approval failed" : "Rejection failed");
    }
    setActionLoading(false);
  };

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
      e.dept_section?.toLowerCase().includes(search.toLowerCase()) ||
      e.submitted_by_name?.toLowerCase().includes(search.toLowerCase())
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
  const totalQty = entries.reduce((s, e) => s + Number(e.production_quantity || 0), 0);
  const uniqueWorkers = new Set(
    entries.flatMap(e => (e.worker_name || "").split(",").map(w => w.trim()).filter(Boolean))
  ).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading entries…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {modal && (
        <ConfirmModal
          entry={modal.entry}
          action={modal.action}
          remarks={modalRemarks}
          setRemarks={setModalRemarks}
          incentive={modalIncentive}
          setIncentive={setModalIncentive}
          onConfirm={handleConfirm}
          onCancel={closeModal}
          loading={actionLoading}
        />
      )}

      {detailEntry && (
        <EntryDetail
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onApprove={(e) => openModal(e, "approve")}
          onReject={(e) => openModal(e, "reject")}
        />
      )}

      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              HR Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Final approval stage — verify incentive amounts and complete the workflow
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: FaClipboardList, label: "Pending Final Approval", value: entries.length, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
            { icon: FaRupeeSign, label: "Incentive to Release", value: `₹${totalIncentive.toLocaleString("en-IN")}`, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
            { icon: FaUsers, label: "Workers Involved", value: uniqueWorkers, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", sub: "across pending entries" },
            { icon: FaShieldAlt, label: "Total Production", value: totalQty.toLocaleString("en-IN"), color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", sub: "units pending release" },
          ].map(({ icon: Icon, label, value, color, bg, sub }) => (
            <div key={label} className={`rounded-2xl p-4 ${bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`${color} opacity-70`} size={13} />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow">

          <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-700 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search OC, machine, worker, dept…"
                className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
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
                    { label: "Approval Trail", field: null },
                    { label: "Submitted", field: "created_at" },
                    { label: "Actions", field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => field && toggleSort(field)}
                      className={`px-4 py-3 font-semibold whitespace-nowrap ${field ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none" : ""}`}
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
                      className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-green-50/30 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      {/* OC Number */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailEntry(entry)}
                          className="font-bold text-green-700 dark:text-green-400 hover:underline"
                        >
                          #{entry.oc_number}
                        </button>
                        <p className="text-[10px] text-gray-400 mt-0.5">{entry.oc_stage} · {entry.oc_type}</p>
                      </td>

                      {/* Machine / Dept */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-white text-xs">{entry.machine_id}</p>
                        <p className="text-[10px] text-gray-400">{entry.dept_section}</p>
                      </td>

                      {/* Workers */}
                      <td className="px-4 py-3 max-w-[140px]">
                        <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{entry.worker_name || "—"}</p>
                        {entry.submitted_by_name && (
                          <p className="text-[10px] text-gray-400">by {entry.submitted_by_name}</p>
                        )}
                      </td>

                      {/* Shift */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          {entry.shift}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{entry.working_hours}h</p>
                      </td>

                      {/* Qty */}
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white text-xs">
                        {Number(entry.production_quantity).toLocaleString("en-IN")}
                      </td>

                      {/* Incentive */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-green-700 dark:text-green-400 text-sm">
                          ₹{Number(entry.incentive_amount).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <FaEdit size={8} /> adjustable
                        </p>
                      </td>

                      {/* Approval Trail */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {["HOD", "Supt."].map(stage => (
                            <span key={stage} className="flex items-center gap-0.5 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-semibold">
                              <FaCheckCircle size={8} /> {stage}
                            </span>
                          ))}
                        </div>
                        {(entry.hod_remarks || entry.superintendent_remarks) && (
                          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 truncate max-w-[120px]">
                            <FaCommentAlt size={7} />
                            {entry.hod_remarks || entry.superintendent_remarks}
                          </p>
                        )}
                      </td>

                      {/* Submitted */}
                      <td className="px-4 py-3 text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        <br />
                        {new Date(entry.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openModal(entry, "approve")}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <FaShieldAlt size={9} /> Approve
                          </button>
                          <button
                            onClick={() => openModal(entry, "reject")}
                            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FaTimesCircle size={9} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-16">
                      <FaShieldAlt size={28} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {search
                          ? `No entries match "${search}"`
                          : "No pending approvals — all incentives processed! ✓"}
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