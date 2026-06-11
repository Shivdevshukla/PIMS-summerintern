import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DEMO_USERS = [
  { role: "Shift Incharge", email: "shift@pims.com", password: "shift123" },
  { role: "HOD",            email: "hod@pims.com",   password: "hod123"   },
  { role: "Superintendent", email: "super@pims.com",  password: "super123" },
  { role: "HR",             email: "hr@pims.com",     password: "hr123"    },
  { role: "Admin",          email: "admin@pims.com",  password: "admin123" },
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Role-based redirect after login
  const roleRedirect = (role) => {
    const map = {
      shift_incharge: "/",
      hod: "/hod-dashboard",
      superintendent: "/superintendent-dashboard",
      hr: "/hr-dashboard",
      admin: "/",
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
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-800 to-indigo-900 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">U</div>
            <span className="font-bold text-xl">Universal Cables Limited</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Production Incentive<br />Management System
          </h1>
          <p className="text-blue-200 text-lg">
            Streamline production tracking, multi-level approvals, and worker incentive calculations in one platform.
          </p>
        </div>
        {/* Add inside the left panel, above the flow steps */}
<div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm">
  <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold mb-1">System Status</p>
  <div className="flex items-center gap-2">
    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
    <span className="text-white text-sm font-medium">All systems operational</span>
  </div>
  <p className="text-blue-200 text-xs mt-2">
    {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
  </p>
</div>
        {/* Flow diagram */}
        <div className="space-y-3">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-4">Approval Workflow</p>
          {["Shift Incharge — Data Entry", "HOD — Level 1 Review", "Superintendent — Level 2 Review", "HR — Final Approval & Incentive"].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">{i + 1}</div>
              <span className="text-blue-100 text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-700">PIMS — UCL</h1>
            <p className="text-gray-500 text-sm mt-1">Production Incentive Management</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to your account</p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
           <input
  type="email"
  autoFocus
  value={email}
  onChange={e => setEmail(e.target.value)}
  placeholder="your@email.com"
  className="w-full border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors"
/>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 pr-10 text-sm focus:border-blue-500 outline-none transition-colors"/>
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
  className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors text-sm flex items-center justify-center gap-2">
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

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Demo Credentials — click to fill</p>
              <div className="space-y-1.5">
                {DEMO_USERS.map(u => (
                  <button key={u.email} onClick={() => { setEmail(u.email); setPassword(u.password); }}
                    className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-colors">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{u.role}</span>
                    <span className="text-xs text-gray-400">{u.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}