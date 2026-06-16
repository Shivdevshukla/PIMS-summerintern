import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../store/store";
import { toast } from "react-toastify";
import { FaCheckCircle, FaEye, FaEyeSlash, FaShieldAlt, FaSun, FaMoon } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [dark, setDark] = useState(false);

  // Read saved theme on mount (same key ThemeToggle uses)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDark(d => !d);
  };

  const roleRedirect = (role) => {
    const map = {
      shift_incharge: "/",
      hod: "/hod-dashboard",
      superintendent: "/superintendent-dashboard",
      hr: "/hr-dashboard",
      admin: "/",
      worker: "/worker-portal",
    };
    return map[role] || "/";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.warning("Please enter email and password");
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      dispatch(login(res.data));
      toast.success("Login Successful!");
      navigate(roleRedirect(res.data.user?.role));
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex bg-gray-50 dark:bg-slate-950">

      {/* ── Dark mode toggle ── */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 shadow-md border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-yellow-300 hover:scale-110 transition-all"
        title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {dark ? <FaSun size={14} /> : <FaMoon size={14} />}
      </button>

      {/* ─── Left Panel — Live Factory Background ─────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative text-white flex-col justify-between p-12 overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center"
  style={{ backgroundImage: "url('/images/factory-bg.jpg')" }}>
</div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f4d]/90 via-[#0a1f4d]/85 to-[#0a1f4d]/95"></div>

        {/* Decorative glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] bg-indigo-500/10 rounded-full blur-3xl"></div>

        {/* Top — Logo + Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <span className="text-[#0a1f4d] font-black text-xl">UCL</span>
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Universal Cables Limited</h2>
              <p className="text-blue-300 text-[11px] font-semibold uppercase tracking-widest">Satna Plant · Madhya Pradesh</p>
            </div>
          </div>
        </div>

        {/* Middle — Main message */}
        <div className="relative z-10 max-w-md">
          <span className="inline-block text-[11px] font-bold text-blue-300 uppercase tracking-[0.2em] mb-4 px-3 py-1 border border-blue-400/30 rounded-full">
            Internal Use Only
          </span>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Production Incentive<br/>Management System
          </h1>
          <p className="text-blue-200/80 text-base leading-relaxed">
            A unified platform for production tracking, multi-level approvals,
            and worker incentive computation across the Satna manufacturing unit.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {["Real-time tracking", "Role-based access", "Automated incentives", "Audit trail"].map(f => (
              <span key={f} className="flex items-center gap-1.5 text-xs bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-blue-100 backdrop-blur-sm">
                <FaCheckCircle className="text-green-400" size={10}/> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom — Workflow + status */}
        <div className="relative z-10 space-y-4">
          <div>
            <p className="text-blue-300 text-[11px] font-bold uppercase tracking-widest mb-3">Approval Workflow</p>
            <div className="flex items-center gap-2">
              {["Shift Incharge", "HOD", "Superintendent", "HR Final"].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">{i+1}</span>
                    <span className="text-xs text-blue-100 whitespace-nowrap">{step}</span>
                  </div>
                  {i < arr.length-1 && <span className="text-blue-400/40 text-xs">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
              </span>
              <span className="text-xs text-blue-100 font-medium">All systems operational</span>
            </div>
            <span className="text-xs text-blue-300/70">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Login Form ─────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">

        {/* Mobile header */}
        <div className="lg:hidden text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#0a1f4d] flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-lg">UCL</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Universal Cables Limited</h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mt-1">PIMS — Satna Plant</p>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                <p className="text-gray-400 text-sm mt-0.5">Sign in to continue to PIMS</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center">
                <FaShieldAlt className="text-blue-600 dark:text-blue-400" size={18}/>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <input type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="employee@ucl.com"
                  className="w-full border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors"/>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 pr-11 text-sm focus:border-blue-500 outline-none transition-colors"/>
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPwd ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                  </button>
                </div>
              </div>

              <div className="flex items-center text-xs">
                <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300"/>
                  Remember me
                </label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#0a1f4d] hover:bg-[#102a66] disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors text-sm flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </>
                ) : "Sign In →"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} Universal Cables Limited — Satna Plant. All rights reserved.<br/>
            <span className="text-gray-300">Authorized personnel only · v1.0</span>
          </p>
        </div>
      </div>
    </div>
  );
}