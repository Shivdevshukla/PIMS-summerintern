import { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return toast.warning("Enter your email");
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent if account exists!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center mb-4">
          <FaEnvelope className="text-blue-600 dark:text-blue-400" size={20}/>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Forgot password?</h2>
        <p className="text-gray-400 text-sm mb-6">
          {sent
            ? "Check your inbox for the reset link."
            : "Enter your email and we'll send you a reset link."}
        </p>

        {!sent ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <input type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)}
                placeholder="employee@ucl.com"
                className="w-full border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#0a1f4d] hover:bg-[#102a66] disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors text-sm">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl p-4 text-sm text-green-700 dark:text-green-300">
            ✅ If an account exists with <strong>{email}</strong>, a password reset link has been sent. The link expires in 30 minutes.
          </div>
        )}

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:underline mt-6">
          <FaArrowLeft size={12}/> Back to login
        </Link>
      </div>
    </div>
  );
}