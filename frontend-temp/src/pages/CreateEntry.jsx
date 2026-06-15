import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import api from "../api";
import {
  FaIndustry, FaChartBar, FaUsers, FaStickyNote,
  FaRupeeSign, FaSearch, FaTimes, FaCheckCircle, FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

const OC_STAGES = ["Extrusion", "Stranding", "Armoring", "Sheathing", "Final", "Inspection"];
const OC_TYPES  = ["Regular", "Special", "Export", "Sample", "Rework"];
const DEPT_SECTIONS = [
  "Cables - Old Plant", "Cables - New Plant",
  "Cables - MVC", "Cables - CCV Line",
  "Capacitor - Clamping", "Capacitor - Winding",
  "Wires - Drawing", "Wires - Annealing",
  "VCV Plant - Ground Floor", "SIOPLAS", "PVC Section",
];

const EMPTY_FORM = {
  machine_id: "",
  dept_section: "",
  oc_stage: "",
  oc_type: "",
  oc_number: "",
  shift: "A",
  shift_date: new Date().toISOString().split("T")[0],
  working_hours: 8,
  production_quantity: "",
  raw_material_used: "",
  incentive_rate: 5,
  incentive_amount: 0,
  remarks: "",
};

const inputCls =
  "border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all";
const labelCls = "block mb-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide";
const errorCls = "text-xs text-red-500 mt-1";

function SectionHeader({ icon: Icon, title, step }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100 dark:border-slate-700">
      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
        {step}
      </div>
      <div className="flex items-center gap-2">
        <Icon className="text-blue-600" size={16} />
        <h2 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h2>
      </div>
    </div>
  );
}

export default function CreateEntry() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerResults, setWorkerResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const searchRef = useRef(null);

  // OC Number duplicate check state
  // ocCheck.status: 'idle' | 'checking' | 'duplicate' | 'available'
  const [ocCheck, setOcCheck] = useState({ status: "idle", message: "" });

  const [form, setForm] = useState(() => {
    // Restore draft from sessionStorage if available
    try {
      const draft = sessionStorage.getItem("pims_entry_draft");
      return draft ? { ...EMPTY_FORM, ...JSON.parse(draft) } : EMPTY_FORM;
    } catch {
      return EMPTY_FORM;
    }
  });

  useEffect(() => { loadWorkers(); }, []);

  // Auto-calculate incentive
  useEffect(() => {
    const qty  = Number(form.production_quantity) || 0;
    const rate = Number(form.incentive_rate) || 0;
    setForm((prev) => ({ ...prev, incentive_amount: (qty * rate).toFixed(2) }));
  }, [form.production_quantity, form.incentive_rate]);

  // Auto-save draft
  useEffect(() => {
    try {
      sessionStorage.setItem("pims_entry_draft", JSON.stringify(form));
    } catch {}
  }, [form]);

  // ── Live OC Number duplicate check (debounced) ──
  useEffect(() => {
    const ocNumber  = form.oc_number.trim();
    const shiftDate = form.shift_date;
    const shift     = form.shift;

    // Not enough info yet — reset to idle
    if (!ocNumber || !shiftDate || !shift) {
      setOcCheck({ status: "idle", message: "" });
      return;
    }

    setOcCheck({ status: "checking", message: "" });

    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/entries/check-oc", {
          params: { oc_number: ocNumber, shift_date: shiftDate, shift },
        });
        if (res.data.duplicate) {
          setOcCheck({ status: "duplicate", message: res.data.message });
        } else {
          setOcCheck({ status: "available", message: "" });
        }
      } catch {
        // Silently ignore — server-side check on submit will still catch it
        setOcCheck({ status: "idle", message: "" });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.oc_number, form.shift_date, form.shift]);

  const loadWorkers = async () => {
    try {
      const res = await api.get("/workers");
      setWorkers(res.data);
    } catch {
      toast.error("Failed to load workers");
    }
  };

  const handleWorkerSearch = (q) => {
    setWorkerSearch(q);
    if (q.trim().length > 0) {
      const filtered = workers.filter(
        (w) =>
          w.name.toLowerCase().includes(q.toLowerCase()) ||
          (w.code || "").toLowerCase().includes(q.toLowerCase())
      );
      setWorkerResults(filtered.slice(0, 8));
    } else {
      setWorkerResults([]);
    }
  };

  const addWorker = (w) => {
    if (!selectedWorkers.find((x) => x.id === w.id)) {
      setSelectedWorkers((prev) => [...prev, w]);
      // Clear worker error if any
      setErrors((prev) => ({ ...prev, workers: undefined }));
    }
    setWorkerSearch("");
    setWorkerResults([]);
    searchRef.current?.focus();
  };

  const removeWorker = (id) =>
    setSelectedWorkers((prev) => prev.filter((w) => w.id !== id));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.machine_id.trim())         e.machine_id = "Machine ID is required";
    if (!form.dept_section)              e.dept_section = "Select a department/section";
    if (!form.oc_stage)                  e.oc_stage = "Select an OC stage";
    if (!form.oc_type)                   e.oc_type = "Select an OC type";
    if (!form.oc_number.trim())          e.oc_number = "OC Number is required";
    else if (ocCheck.status === "duplicate") e.oc_number = ocCheck.message;
    else if (ocCheck.status === "checking")  e.oc_number = "Checking OC Number, please wait…";
    if (!form.shift_date)                e.shift_date = "Shift date is required";
    if (!form.working_hours || Number(form.working_hours) <= 0)
                                         e.working_hours = "Working hours must be > 0";
    if (!form.production_quantity || Number(form.production_quantity) <= 0)
                                         e.production_quantity = "Production quantity must be > 0";
    if (selectedWorkers.length === 0)    e.workers = "Add at least one worker";
    return e;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedWorkers([]);
    setErrors({});
    setSubmitted(false);
    setOcCheck({ status: "idle", message: "" });
    try { sessionStorage.removeItem("pims_entry_draft"); } catch {}
  };

  const submitEntry = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warning("Please fix the highlighted fields");
      return;
    }

    setLoading(true);
    try {
      const worker_name = selectedWorkers.map((w) => w.name).join(", ");
      await api.post("/entries", {
        worker_name,
        machine_id:          form.machine_id,
        dept_section:        form.dept_section,
        oc_stage:            form.oc_stage,
        oc_type:             form.oc_type,
        oc_number:           form.oc_number,
        shift:               form.shift,
        shift_date:          form.shift_date,
        working_hours:       Number(form.working_hours),
        production_quantity: Number(form.production_quantity),
        raw_material_used:   Number(form.raw_material_used) || 0,
        incentive_amount:    Number(form.incentive_amount),
        remarks:             form.remarks,
      });

      setSubmitted(true);
      try { sessionStorage.removeItem("pims_entry_draft"); } catch {}
      toast.success("Entry submitted for HOD approval!");
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data?.errors;

      if (err.response?.status === 409) {
        // Duplicate OC caught by backend (race condition fallback)
        const msg = err.response?.data?.error || "This OC entry already exists for this shift.";
        setOcCheck({ status: "duplicate", message: msg });
        setErrors((prev) => ({ ...prev, oc_number: msg }));
        toast.error(msg);
      } else if (backendErrors?.length > 0) {
        backendErrors.forEach((e) => toast.error(e.msg));
      } else {
        toast.error(err.response?.data?.error || "Submission failed");
      }
    }
    setLoading(false);
  };

  // ── Success state ──
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Entry Submitted!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Your production entry has been sent to the HOD for approval. You can track its status on the dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetForm}
              className="px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
            >
              + New Entry
            </button>
            <a
              href="/"
              className="px-5 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const perWorkerIncentive =
    selectedWorkers.length > 0
      ? (Number(form.incentive_amount) / selectedWorkers.length).toFixed(2)
      : "0.00";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Production Entry</h1>
          <p className="text-sm text-gray-400 mt-0.5">Fill in the details below to submit an entry for HOD approval</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
        >
          Clear form
        </button>
      </div>

      <form onSubmit={submitEntry} className="space-y-5" noValidate>

        {/* ── Section 1: Machine & OC Details ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <SectionHeader icon={FaIndustry} title="Machine & OC Details" step={1} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className={labelCls}>Machine ID *</label>
              <input
                type="text" name="machine_id" value={form.machine_id}
                onChange={handleChange} placeholder="e.g. RBD Machine - F-13"
                className={`${inputCls} ${errors.machine_id ? "border-red-400 focus:ring-red-400" : ""}`}
              />
              {errors.machine_id && <p className={errorCls}>{errors.machine_id}</p>}
            </div>

            <div>
              <label className={labelCls}>Department / Section *</label>
              <select
                name="dept_section" value={form.dept_section}
                onChange={handleChange}
                className={`${inputCls} ${errors.dept_section ? "border-red-400" : ""}`}
              >
                <option value="">Select Department/Section</option>
                {DEPT_SECTIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
              {errors.dept_section && <p className={errorCls}>{errors.dept_section}</p>}
            </div>

            <div>
              <label className={labelCls}>OC Stage *</label>
              <select
                name="oc_stage" value={form.oc_stage}
                onChange={handleChange}
                className={`${inputCls} ${errors.oc_stage ? "border-red-400" : ""}`}
              >
                <option value="">Select OC Stage</option>
                {OC_STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.oc_stage && <p className={errorCls}>{errors.oc_stage}</p>}
            </div>

            <div>
              <label className={labelCls}>OC Type *</label>
              <select
                name="oc_type" value={form.oc_type}
                onChange={handleChange}
                className={`${inputCls} ${errors.oc_type ? "border-red-400" : ""}`}
              >
                <option value="">Select OC Type</option>
                {OC_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {errors.oc_type && <p className={errorCls}>{errors.oc_type}</p>}
            </div>

            <div>
              <label className={labelCls}>OC Number *</label>
              <div className="relative">
                <input
                  type="text" name="oc_number" value={form.oc_number}
                  onChange={handleChange} placeholder="e.g. 1256"
                  className={`${inputCls} pr-9 ${
                    errors.oc_number || ocCheck.status === "duplicate"
                      ? "border-red-400 focus:ring-red-400"
                      : ocCheck.status === "available"
                      ? "border-green-300 focus:ring-green-400"
                      : ""
                  }`}
                />
                {/* Status icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {ocCheck.status === "checking" && (
                    <FaSpinner className="animate-spin text-gray-400" size={13} />
                  )}
                  {ocCheck.status === "available" && (
                    <FaCheckCircle className="text-green-500" size={13} />
                  )}
                  {ocCheck.status === "duplicate" && (
                    <FaExclamationTriangle className="text-red-500" size={13} />
                  )}
                </div>
              </div>

              {/* Inline feedback */}
              {ocCheck.status === "duplicate" && !errors.oc_number && (
                <p className="text-xs text-red-500 mt-1 flex items-start gap-1">
                  <FaExclamationTriangle className="mt-0.5 shrink-0" size={11} />
                  {ocCheck.message}
                </p>
              )}
              {ocCheck.status === "available" && form.oc_number.trim() && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <FaCheckCircle size={11} />
                  Available for Shift {form.shift} on this date
                </p>
              )}
              {errors.oc_number && <p className={errorCls}>{errors.oc_number}</p>}
            </div>

            <div>
              <label className={labelCls}>Shift Date *</label>
              <input
                type="date" name="shift_date" value={form.shift_date}
                onChange={handleChange}
                className={`${inputCls} ${errors.shift_date ? "border-red-400" : ""}`}
              />
              {errors.shift_date && <p className={errorCls}>{errors.shift_date}</p>}
            </div>

            <div>
              <label className={labelCls}>Shift *</label>
              <div className="grid grid-cols-3 gap-2">
                {["A", "B", "C"].map((s) => (
                  <button
                    key={s} type="button"
                    onClick={() => setForm({ ...form, shift: s })}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all
                      ${form.shift === s
                        ? "bg-blue-700 text-white border-blue-700 shadow-md"
                        : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-300 hover:border-blue-400"
                      }`}
                  >
                    Shift {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Working Hours *</label>
              <input
                type="number" name="working_hours" value={form.working_hours}
                onChange={handleChange} min="1" max="12"
                className={`${inputCls} ${errors.working_hours ? "border-red-400" : ""}`}
              />
              {errors.working_hours && <p className={errorCls}>{errors.working_hours}</p>}
            </div>

          </div>
        </div>

        {/* ── Section 2: Production Data ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <SectionHeader icon={FaChartBar} title="Production Data" step={2} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className={labelCls}>Production Quantity *</label>
              <input
                type="number" name="production_quantity"
                value={form.production_quantity} onChange={handleChange}
                placeholder="Enter quantity (meters / units)"
                className={`${inputCls} ${errors.production_quantity ? "border-red-400" : ""}`}
              />
              {errors.production_quantity && <p className={errorCls}>{errors.production_quantity}</p>}
            </div>

            <div>
              <label className={labelCls}>Raw Material Used (kg)</label>
              <input
                type="number" name="raw_material_used"
                value={form.raw_material_used} onChange={handleChange}
                placeholder="0"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Incentive Rate (₹ per unit)</label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                <input
                  type="number" name="incentive_rate"
                  value={form.incentive_rate} onChange={handleChange}
                  className={`${inputCls} pl-7`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Incentive Amount (Auto-calculated)</label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" size={12} />
                <input
                  type="number" readOnly name="incentive_amount"
                  value={form.incentive_amount}
                  className={`${inputCls} pl-7 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 font-bold text-green-700 dark:text-green-400 cursor-not-allowed`}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Quantity × Rate = ₹{form.incentive_amount}</p>
            </div>

          </div>
        </div>

        {/* ── Section 3: Workers ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <SectionHeader icon={FaUsers} title="Workers on This Entry" step={3} />

          {/* Search input */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              ref={searchRef}
              type="text" value={workerSearch}
              onChange={(e) => handleWorkerSearch(e.target.value)}
              placeholder="Search worker by name or code…"
              className={`${inputCls} pl-10 ${errors.workers ? "border-red-400" : ""}`}
            />
            {workerSearch && (
              <button
                type="button"
                onClick={() => { setWorkerSearch(""); setWorkerResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={12} />
              </button>
            )}

            {/* Dropdown results */}
            {workerResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl mt-1 z-20 shadow-xl max-h-52 overflow-y-auto">
                {workerResults.map((w) => {
                  const alreadyAdded = !!selectedWorkers.find((x) => x.id === w.id);
                  return (
                    <button
                      key={w.id} type="button"
                      onClick={() => !alreadyAdded && addWorker(w)}
                      disabled={alreadyAdded}
                      className={`w-full text-left px-4 py-2.5 flex justify-between items-center text-sm transition-colors
                        ${alreadyAdded
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-blue-50 dark:hover:bg-slate-600"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                          {w.name[0]}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white">{w.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">{w.code}</span>
                        {alreadyAdded && <span className="text-[10px] text-green-600 font-semibold">Added</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {workerSearch.length > 1 && workerResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl mt-1 z-20 shadow-xl px-4 py-3 text-sm text-gray-400">
                No workers found for "{workerSearch}"
              </div>
            )}
          </div>

          {errors.workers && <p className={`${errorCls} mb-3`}>{errors.workers}</p>}

          {/* Selected workers list */}
          {selectedWorkers.length > 0 ? (
            <div className="space-y-2">
              {selectedWorkers.map((w, i) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between bg-blue-50 dark:bg-slate-700 rounded-xl px-4 py-2.5 border border-blue-100 dark:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{w.name}</p>
                      <p className="text-xs text-gray-400">{w.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-green-700 dark:text-green-400 font-semibold">
                      ₹{perWorkerIncentive}
                    </span>
                    <button
                      type="button" onClick={() => removeWorker(w.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <FaTimes size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">
                {selectedWorkers.length} worker{selectedWorkers.length > 1 ? "s" : ""} — ₹{perWorkerIncentive} each
              </p>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-600">
              <FaUsers className="mx-auto mb-1.5 text-gray-300" size={22} />
              <p className="text-sm text-gray-400">Search and add workers above</p>
            </div>
          )}
        </div>

        {/* ── Section 4: Remarks ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
          <SectionHeader icon={FaStickyNote} title="Remarks & Notes" step={4} />

          <textarea
            name="remarks" value={form.remarks} onChange={handleChange}
            rows={3}
            placeholder="e.g. Machine bearing issue at 14:30, reported to HOD… (optional)"
            className={`${inputCls} resize-none`}
          />
          <p className="text-[10px] text-gray-400 mt-1.5">Machine issues, injuries, any notes to HOD</p>
        </div>

        {/* ── Incentive Summary + Submit ── */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-5 flex items-center justify-between text-white shadow-lg">
          <div>
            <p className="text-blue-200 text-xs font-medium mb-0.5">Total Incentive Amount</p>
            <p className="text-4xl font-bold">₹{Number(form.incentive_amount).toLocaleString("en-IN")}</p>
            {selectedWorkers.length > 1 && (
              <p className="text-blue-200 text-xs mt-1">
                = ₹{perWorkerIncentive} per worker × {selectedWorkers.length} workers
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || ocCheck.status === "checking" || ocCheck.status === "duplicate"}
            className="flex items-center gap-2.5 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-70 disabled:cursor-not-allowed font-bold text-sm px-6 py-3 rounded-xl transition-all shadow"
          >
            {loading ? (
              <><FaSpinner className="animate-spin" size={14} /> Submitting…</>
            ) : ocCheck.status === "duplicate" ? (
              <><FaExclamationTriangle size={14} /> Duplicate OC Number</>
            ) : (
              <><FaCheckCircle size={14} /> Submit for HOD Approval</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}