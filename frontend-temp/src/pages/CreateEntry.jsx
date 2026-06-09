import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import api from "../api";

const OC_STAGES = ["Extrusion", "Stranding", "Armoring", "Sheathing", "Final", "Inspection"];
const OC_TYPES  = ["Regular", "Special", "Export", "Sample", "Rework"];
const DEPT_SECTIONS = [
  "Cables - Old Plant", "Cables - New Plant",
  "Cables - MVC", "Cables - CCV Line",
  "Capacitor - Clamping", "Capacitor - Winding",
  "Wires - Drawing", "Wires - Annealing",
  "VCV Plant - Ground Floor", "SIOPLAS", "PVC Section"
];

export default function CreateEntry() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerResults, setWorkerResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    machine_id: "",
    dept_section: "",
    oc_stage: "",
    oc_type: "",
    oc_number: "",
    shift: "A",
    shift_date: new Date().toISOString().split("T")[0],
    working_hours: 8,
    production_quantity: "",
    raw_material_used: 0,
    incentive_rate: 5,
    incentive_amount: 0,
    remarks: "",
  });

  useEffect(() => { loadWorkers(); }, []);

  // Auto-calculate incentive
  useEffect(() => {
    const qty  = Number(form.production_quantity) || 0;
    const rate = Number(form.incentive_rate) || 0;
    setForm(prev => ({ ...prev, incentive_amount: (qty * rate).toFixed(2) }));
  }, [form.production_quantity, form.incentive_rate]);

  const loadWorkers = async () => {
    try {
      const res = await api.get("/workers");
      setWorkers(res.data);
    } catch {
      toast.error("Failed to load workers");
    }
  };

  // Worker search filter
  const handleWorkerSearch = (q) => {
    setWorkerSearch(q);
    if (q.length > 0) {
      setWorkerResults(
        workers.filter(w =>
          w.name.toLowerCase().includes(q.toLowerCase()) ||
          (w.code || "").toLowerCase().includes(q.toLowerCase())
        )
      );
    } else {
      setWorkerResults([]);
    }
  };

  const addWorker = (w) => {
    if (!selectedWorkers.find(x => x.id === w.id)) {
      setSelectedWorkers([...selectedWorkers, w]);
    }
    setWorkerSearch("");
    setWorkerResults([]);
  };

  const removeWorker = (id) =>
    setSelectedWorkers(selectedWorkers.filter(w => w.id !== id));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitEntry = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.machine_id)       return toast.warning("Machine ID is required");
    if (!form.dept_section)     return toast.warning("Department / Section is required");
    if (!form.oc_stage)         return toast.warning("OC Stage is required");
    if (!form.oc_type)          return toast.warning("OC Type is required");
    if (!form.oc_number)        return toast.warning("OC Number is required");
    if (!form.shift)             return toast.warning("Shift is required");
    if (!form.shift_date)       return toast.warning("Shift Date is required");
    if (!form.working_hours || Number(form.working_hours) <= 0)
                                 return toast.warning("Working Hours must be > 0");
    if (!form.production_quantity || Number(form.production_quantity) <= 0)
                                 return toast.warning("Production Quantity must be > 0");
    if (selectedWorkers.length === 0)
                                 return toast.warning("Please add at least one worker");

    setLoading(true);
    try {
      // Build worker_name string from selected workers
      const worker_name = selectedWorkers.map(w => w.name).join(", ");

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

      toast.success("Entry submitted for HOD approval!");

      // Reset form
      setForm({
        machine_id: "", dept_section: "", oc_stage: "", oc_type: "",
        oc_number: "", shift: "A",
        shift_date: new Date().toISOString().split("T")[0],
        working_hours: 8, production_quantity: "",
        raw_material_used: 0, incentive_rate: 5,
        incentive_amount: 0, remarks: "",
      });
      setSelectedWorkers([]);

    } catch (err) {
      console.error(err);
      // Show all validation errors from backend
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && backendErrors.length > 0) {
        backendErrors.forEach(e => toast.error(e.msg));
      } else {
        toast.error(err.response?.data?.error || "Submission failed");
      }
    }
    setLoading(false);
  };

  const inputCls = "border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none";
  const labelCls = "block mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Create Production Entry
      </h1>

      <form onSubmit={submitEntry}
        className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-gray-900 dark:text-white space-y-6">

        {/* ── Machine & OC Details ── */}
        <div>
          <h2 className="text-base font-bold text-blue-700 mb-4 pb-2 border-b border-gray-100">
            Machine & OC Details
          </h2>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className={labelCls}>Machine ID *</label>
              <input type="text" name="machine_id" value={form.machine_id}
                onChange={handleChange} placeholder="e.g. RBD Machine - F-13"
                className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Department / Section *</label>
              <select name="dept_section" value={form.dept_section}
                onChange={handleChange} className={inputCls}>
                <option value="">Select Department/Section</option>
                {DEPT_SECTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>OC Stage *</label>
              <select name="oc_stage" value={form.oc_stage}
                onChange={handleChange} className={inputCls}>
                <option value="">Select OC Stage</option>
                {OC_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>OC Type *</label>
              <select name="oc_type" value={form.oc_type}
                onChange={handleChange} className={inputCls}>
                <option value="">Select OC Type</option>
                {OC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>OC Number *</label>
              <input type="text" name="oc_number" value={form.oc_number}
                onChange={handleChange} placeholder="e.g. 1256"
                className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Shift Date *</label>
              <input type="date" name="shift_date" value={form.shift_date}
                onChange={handleChange} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Shift *</label>
              <div className="flex gap-2">
                {["A","B","C"].map(s => (
                  <button key={s} type="button" onClick={() => setForm({...form, shift: s})}
                    className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-colors
                    ${form.shift === s
                      ? "bg-blue-700 text-white border-blue-700"
                      : "border-gray-300 text-gray-600 dark:border-slate-600 dark:text-gray-300 hover:border-blue-400"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Working Hours *</label>
              <input type="number" name="working_hours" value={form.working_hours}
                onChange={handleChange} min="1" max="12" className={inputCls} />
            </div>

          </div>
        </div>

        {/* ── Production Data ── */}
        <div>
          <h2 className="text-base font-bold text-blue-700 mb-4 pb-2 border-b border-gray-100">
            Production Data
          </h2>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className={labelCls}>Production Quantity *</label>
              <input type="number" name="production_quantity"
                value={form.production_quantity} onChange={handleChange}
                placeholder="Enter quantity" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Raw Material Used (kg)</label>
              <input type="number" name="raw_material_used"
                value={form.raw_material_used} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Incentive Rate (₹ per unit)</label>
              <input type="number" name="incentive_rate"
                value={form.incentive_rate} onChange={handleChange}
                className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Incentive Amount (Auto)</label>
              <input type="number" readOnly name="incentive_amount"
                value={form.incentive_amount}
                className={`${inputCls} bg-green-50 dark:bg-slate-600 font-bold text-green-700`} />
            </div>

          </div>
        </div>

        {/* ── Worker Search ── */}
        <div>
          <h2 className="text-base font-bold text-blue-700 mb-4 pb-2 border-b border-gray-100">
            Workers on This Entry *
          </h2>

          <div className="relative mb-3">
            <input type="text" value={workerSearch}
              onChange={e => handleWorkerSearch(e.target.value)}
              placeholder="🔍 Search worker by name or code..."
              className={inputCls} />
            {workerResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl mt-1 z-10 shadow-lg max-h-48 overflow-y-auto">
                {workerResults.map(w => (
                  <button key={w.id} type="button" onClick={() => addWorker(w)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-600 text-sm flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-white">{w.name}</span>
                    <span className="text-gray-400 text-xs">{w.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedWorkers.length > 0 ? (
            <div className="space-y-2">
              {selectedWorkers.map(w => (
                <div key={w.id} className="flex items-center justify-between bg-blue-50 dark:bg-slate-700 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {w.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{w.name}</p>
                      <p className="text-xs text-gray-400">{w.code}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeWorker(w.id)}
                    className="text-red-400 hover:text-red-600 text-lg font-bold">✕</button>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-1">
                Per worker incentive: ₹{selectedWorkers.length > 0
                  ? (Number(form.incentive_amount) / selectedWorkers.length).toFixed(2)
                  : 0}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 bg-gray-50 dark:bg-slate-700 rounded-xl py-4 text-center">
              Search and add workers above
            </p>
          )}
        </div>

        {/* ── Remarks ── */}
        <div>
          <label className={labelCls}>
            Remarks <span className="font-normal text-gray-400">(machine damage, injury, notes to HOD)</span>
          </label>
          <textarea name="remarks" value={form.remarks} onChange={handleChange}
            rows={3} placeholder="e.g. Machine bearing issue at 14:30, reported to HOD..."
            className={`${inputCls} resize-none`} />
        </div>

        {/* ── Incentive Summary ── */}
        <div className="bg-blue-700 rounded-xl p-4 flex items-center justify-between text-white">
          <div>
            <p className="text-blue-200 text-sm">Total Incentive Amount</p>
            <p className="text-3xl font-bold">₹{form.incentive_amount}</p>
            {selectedWorkers.length > 1 && (
              <p className="text-blue-200 text-xs mt-1">
                = ₹{(Number(form.incentive_amount) / selectedWorkers.length).toFixed(2)} per worker
              </p>
            )}
          </div>
          <div className="text-5xl opacity-20">₹</div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-base transition-colors">
          {loading ? "Submitting..." : "✓ Submit Entry for HOD Approval"}
        </button>

      </form>
    </div>
  );
}