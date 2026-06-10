import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStrength = (pw) => {
    if (!pw) return { label: "", color: "", width: "0%" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "20%" };
    if (score === 2) return { label: "Fair", color: "bg-orange-400", width: "40%" };
    if (score === 3) return { label: "Good", color: "bg-yellow-400", width: "60%" };
    if (score === 4) return { label: "Strong", color: "bg-blue-500", width: "80%" };
    return { label: "Very Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (form.newPassword === form.currentPassword) {
      return toast.warning("New password must be different from current password");
    }
    setLoading(true);
    try {
      const res = await api.put("/users/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success(res.data.message || "Password Changed Successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to Change Password");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500";

  const PasswordInput = ({ label, field, show, setShow, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={inputClass}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium select-none"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Change Password
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update your account password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              label="Current Password"
              field="currentPassword"
              show={showCurrent}
              setShow={setShowCurrent}
              placeholder="Enter current password"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className={inputClass}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium select-none"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
              {/* Strength bar */}
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Password Strength
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        strength.label === "Weak"
                          ? "text-red-500"
                          : strength.label === "Fair"
                          ? "text-orange-400"
                          : strength.label === "Good"
                          ? "text-yellow-500"
                          : strength.label === "Strong"
                          ? "text-blue-500"
                          : "text-green-500"
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  className={`${inputClass} ${
                    form.confirmPassword &&
                    form.newPassword !== form.confirmPassword
                      ? "border-red-400 focus:ring-red-400"
                      : form.confirmPassword &&
                        form.newPassword === form.confirmPassword
                      ? "border-green-400 focus:ring-green-400"
                      : ""
                  }`}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium select-none"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {form.confirmPassword &&
                form.newPassword !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
              {form.confirmPassword &&
                form.newPassword === form.confirmPassword && (
                  <p className="text-xs text-green-500 mt-1">
                    Passwords match ✓
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition mt-2"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </form>

          {/* Tips */}
          <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Password Tips:
            </p>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <li>• Use at least 6 characters</li>
              <li>• Mix uppercase, lowercase & numbers</li>
              <li>• Add special characters (!, @, #) for extra security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;