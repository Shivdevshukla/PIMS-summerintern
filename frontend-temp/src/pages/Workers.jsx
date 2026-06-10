import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";
import Swal from "sweetalert2";

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [editingWorker, setEditingWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/workers");
      setWorkers(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to Load Workers");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingWorker(null);
    setName("");
    setCode("");
    setDepartment("");
    setDesignation("");
  };

  const addWorker = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      return toast.warning("Name and Code are required");
    }
    try {
      await api.post("/workers", { name, code, department, designation });
      toast.success("Worker Added Successfully");
      resetForm();
      loadWorkers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to Add Worker");
    }
  };

  const updateWorker = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      return toast.warning("Name and Code are required");
    }
    try {
      await api.put(`/workers/${editingWorker.id}`, {
        name,
        code,
        department,
        designation,
      });
      toast.success("Worker Updated Successfully");
      resetForm();
      loadWorkers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to Update Worker");
    }
  };

  const deleteWorker = async (id) => {
    const result = await Swal.fire({
      title: "Delete Worker?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/workers/${id}`);
      toast.success("Worker Deleted Successfully");
      loadWorkers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to Delete Worker");
    }
  };

  const editWorker = (worker) => {
    setEditingWorker(worker);
    setName(worker.name);
    setCode(worker.code);
    setDepartment(worker.department || "");
    setDesignation(worker.designation || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase()) ||
      (w.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.designation || "").toLowerCase().includes(search.toLowerCase())
  );

  const inputClass =
    "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

  return (
    <div className="p-6 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Worker Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Add, update and manage workers
        </p>
      </div>

      {/* Add / Update Worker Form */}
      <form
        onSubmit={editingWorker ? updateWorker : addWorker}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
          {editingWorker ? `Editing: ${editingWorker.name}` : "Add New Worker"}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Worker Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Worker Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. W001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Department
            </label>
            <input
              type="text"
              placeholder="e.g. Production"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Designation
            </label>
            <input
              type="text"
              placeholder="e.g. Operator"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
          >
            {editingWorker ? "Update Worker" : "Add Worker"}
          </button>

          {editingWorker && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Worker List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Workers List{" "}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({filteredWorkers.length} of {workers.length})
            </span>
          </h2>
          <input
            type="text"
            placeholder="Search by name, code, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <th className="p-3 text-left font-semibold">Code</th>
                <th className="p-3 text-left font-semibold">Name</th>
                <th className="p-3 text-left font-semibold">Department</th>
                <th className="p-3 text-left font-semibold">Designation</th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-400">
                    Loading workers...
                  </td>
                </tr>
              ) : filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker) => (
                  <tr
                    key={worker.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700/60 transition"
                  >
                    <td className="p-3 font-mono text-blue-700 dark:text-blue-400 font-semibold">
                      {worker.code}
                    </td>
                    <td className="p-3 font-medium">{worker.name}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                      {worker.department || (
                        <span className="text-gray-300 dark:text-gray-600 italic">—</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                      {worker.designation || (
                        <span className="text-gray-300 dark:text-gray-600 italic">—</span>
                      )}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => editWorker(worker)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteWorker(worker.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-500 dark:text-gray-400">
                    {search ? "No workers match your search." : "No workers found. Add one above."}
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