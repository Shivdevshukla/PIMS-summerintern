import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";
import ProfilePhotoUpload from "../components/ProfilePhotoUpload";

const ROLE_OPTIONS = [
  { value: "shift_incharge", label: "Shift Incharge" },
  { value: "hod", label: "HOD" },
  { value: "superintendent", label: "Superintendent" },
  { value: "hr", label: "HR" },
  { value: "admin", label: "Admin" },
  { value: "worker", label: "Worker (Self-Service)" },
];

const roleBadge = (role) => {
  const map = {
    admin:          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    hr:             "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    hod:            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    superintendent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    shift_incharge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    worker:         "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  };
  return map[role] || "bg-gray-100 text-gray-700";
};

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "shift_incharge",
  });
  const [showPassword, setShowPassword] = useState(false);

  // ── Worker portal linking state ──
  const [workerUsers,      setWorkerUsers]      = useState([]);  // users with role=worker
  const [unlinkedWorkers,  setUnlinkedWorkers]  = useState([]);  // workers with no login
  const [linkForm,         setLinkForm]         = useState({ user_id: "", worker_id: "" });
  const [linkLoading,      setLinkLoading]      = useState(false);
  const [workerTabLoading, setWorkerTabLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to Load Users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchWorkerPortalData();
  }, []);

  const fetchWorkerPortalData = async () => {
    setWorkerTabLoading(true);
    try {
      const [wuRes, uwRes] = await Promise.all([
        api.get("/users/worker-users"),
        api.get("/users/unlinked-workers"),
      ]);
      setWorkerUsers(wuRes.data);
      setUnlinkedWorkers(uwRes.data);
    } catch (err) {
      console.error("Worker portal data error:", err);
    }
    setWorkerTabLoading(false);
  };

  const linkWorker = async (e) => {
    e.preventDefault();
    if (!linkForm.user_id || !linkForm.worker_id)
      return toast.warning("Select both a worker login and a worker profile");

    setLinkLoading(true);
    try {
      await api.post("/users/link-worker", {
        user_id:   Number(linkForm.user_id),
        worker_id: Number(linkForm.worker_id),
      });
      toast.success("Worker linked! They can now log in and see their entries.");
      setLinkForm({ user_id: "", worker_id: "" });
      fetchWorkerPortalData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to link worker");
    }
    setLinkLoading(false);
  };

  const unlinkWorker = async (userId, name) => {
    if (!window.confirm(`Remove portal access for ${name}? They will no longer be able to log in to the worker portal.`))
      return;
    try {
      await api.delete(`/users/link-worker/${userId}`);
      toast.success(`${name} unlinked from worker portal`);
      fetchWorkerPortalData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to unlink worker");
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.warning("Please fill all fields");
    }
    if (form.password.length < 6) {
      return toast.warning("Password must be at least 6 characters");
    }
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === form.email.toLowerCase()
    );
    if (emailExists) {
      return toast.warning("Email already exists");
    }
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "shift_incharge" });
      fetchUsers();
      toast.success("User Added Successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to Add User");
    }
  };

  const deleteUser = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User Deleted Successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to Delete User");
    }
  };

  const updateRole = async (id, role) => {
    const label = ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
    const result = await Swal.fire({
      title: "Update Role?",
      text: `Change role to ${label}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Update",
    });
    if (!result.isConfirmed) return;
    try {
      await api.put(`/users/${id}`, { role });
      toast.success("Role Updated Successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to Update Role");
    }
  };

  const resetPassword = async (id, userName) => {
    const { value: password } = await Swal.fire({
      title: `Reset Password`,
      html: `<p class="text-sm text-gray-500 mb-3">Setting new password for <strong>${userName}</strong></p>`,
      input: "password",
      inputLabel: "New Password (min. 6 characters)",
      inputPlaceholder: "Enter new password",
      inputAttributes: { minlength: 6, autocomplete: "new-password" },
      showCancelButton: true,
      confirmButtonText: "Reset Password",
      confirmButtonColor: "#d97706",
      inputValidator: (value) => {
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
      },
    });
    if (!password) return;
    try {
      await api.put(`/users/${id}/reset-password`, { password });
      toast.success(`Password reset for ${userName}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to Reset Password");
    }
  };

  const inputClass =
    "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage system users and roles
        </p>
      </div>

      {/* Add User Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Add New User
        </h2>
        <form
          onSubmit={addUser}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <input
            type="text"
            placeholder="Full Name"
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email Address"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={inputClass + " pr-10"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <select
            className={inputClass}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-3 transition"
          >
            Add User
          </button>
        </form>
      </div>
{/* Admin Profile Card */}
<div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 mb-6 flex items-center gap-6">
  <ProfilePhotoUpload size={80} />
  <div>
    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Profile</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Manage your profile photo and account details
    </p>
  </div>
</div>

      {/* ── Worker Portal Management ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <span className="text-teal-600 dark:text-teal-400 text-sm font-bold">W</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Worker Portal Management</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Create a worker login (role = Worker) then link it to their production worker profile below
            </p>
          </div>
        </div>

        {/* How it works banner */}
        <div className="mt-4 mb-5 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">How to give a worker portal access — 2 steps:</p>
          <div className="flex flex-wrap gap-3">
            {[
              { step: "1", text: 'Use "Add New User" above — set role to "Worker (Self-Service)" and set a password' },
              { step: "2", text: 'Use the Link form below — connect that login to their production worker profile' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-2 text-xs text-teal-700 dark:text-teal-300">
                <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold shrink-0">{step}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Link form */}
        <form onSubmit={linkWorker} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Worker Login Account
            </label>
            <select
              value={linkForm.user_id}
              onChange={e => setLinkForm(f => ({ ...f, user_id: e.target.value }))}
              className={inputClass}
            >
              <option value="">— Select worker login —</option>
              {workerUsers.map(wu => (
                <option key={wu.user_id} value={wu.user_id}>
                  {wu.user_name} ({wu.email})
                  {wu.worker_id ? " ✓ Linked" : " — Not linked"}
                </option>
              ))}
            </select>
            {workerUsers.length === 0 && !workerTabLoading && (
              <p className="text-[10px] text-gray-400 mt-1">No worker-role users yet. Add one above first.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Worker Profile (from Workers list)
            </label>
            <select
              value={linkForm.worker_id}
              onChange={e => setLinkForm(f => ({ ...f, worker_id: e.target.value }))}
              className={inputClass}
            >
              <option value="">— Select worker profile —</option>
              {unlinkedWorkers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.code} {w.department ? `(${w.department})` : ""}
                </option>
              ))}
            </select>
            {unlinkedWorkers.length === 0 && !workerTabLoading && (
              <p className="text-[10px] text-gray-400 mt-1">All workers are already linked.</p>
            )}
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={linkLoading || !linkForm.user_id || !linkForm.worker_id}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-3 transition text-sm"
            >
              {linkLoading ? "Linking…" : "🔗 Link Worker to Login"}
            </button>
          </div>
        </form>

        {/* Currently linked workers */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
            Worker Portal Accounts
            <span className="ml-2 text-xs font-normal text-gray-400">({workerUsers.length})</span>
          </h3>

          {workerTabLoading ? (
            <div className="text-center py-6 text-gray-400 text-sm animate-pulse">Loading…</div>
          ) : workerUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 dark:bg-slate-700/30 rounded-xl">
              No worker portal accounts yet. Add a user with "Worker" role above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <th className="px-4 py-2.5 font-semibold">Login Name</th>
                    <th className="px-4 py-2.5 font-semibold">Email</th>
                    <th className="px-4 py-2.5 font-semibold">Linked Worker Profile</th>
                    <th className="px-4 py-2.5 font-semibold">Worker Code</th>
                    <th className="px-4 py-2.5 font-semibold">Department</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workerUsers.map(wu => (
                    <tr key={wu.user_id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{wu.user_name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{wu.email}</td>
                      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">
                        {wu.worker_name || <span className="text-orange-500 text-xs font-semibold">⚠ Not linked</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{wu.code || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{wu.department || "—"}</td>
                      <td className="px-4 py-3">
                        {wu.worker_id ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                            ✓ Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full">
                            ⚠ Needs linking
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {wu.worker_id && (
                          <button
                            onClick={() => unlinkWorker(wu.user_id, wu.user_name)}
                            className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline transition-colors"
                          >
                            Unlink
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            System Users{" "}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({filteredUsers.length} of {users.length})
            </span>
          </h2>
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Change Role</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition"
                  >
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadge(
                          user.role
                        )}`}
                      >
                        {user.role.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => resetPassword(user.id, user.name)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Reset Password
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;