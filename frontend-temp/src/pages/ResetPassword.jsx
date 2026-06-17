import { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.warning("Password must be at least 6 characters");
    if (password !== confirm) return toast.warning("Passwords do not match");

    try {
      setLoading(true);
await api.post("/auth/reset-password", { token, newPassword: password });
      toast.success("Password reset successful! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h2>
          <p className="text-gray-500 text-sm mb-4">This password reset link is missing or invalid.</p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm font-medium">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center mb-4">
          <FaLock className="text-blue-600 dark:text-blue-400" size={18}/>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Set new password</h2>
        <p className="text-gray-400 text-sm mb-6">Choose a strong password for your account.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 pr-11 text-sm focus:border-blue-500 outline-none transition-colors"/>
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
            <input type={showPwd ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors"/>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#0a1f4d] hover:bg-[#102a66] disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors text-sm">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}