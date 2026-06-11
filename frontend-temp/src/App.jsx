import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateEntry from "./pages/CreateEntry";
import Layout from "./components/Layout";
import HODDashboard from "./pages/HODDashboard";
import SuperintendentDashboard from "./pages/SuperintendentDashboard";
import HRDashboard from "./pages/HRDashboard";
import ReportsDashboard from "./pages/ReportsDashboard";
import Workers from "./pages/Workers";
import UserManagement from "./pages/UserManagement";
import ChangePassword from "./pages/ChangePassword";

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, allowedRoles }) {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500">You don't have permission to view this page.</p>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route
            path="create-entry"
            element={
              <RoleRoute allowedRoles={["shift_incharge", "admin"]}>
                <CreateEntry />
              </RoleRoute>
            }
          />

          <Route
            path="hod-dashboard"
            element={
              <RoleRoute allowedRoles={["hod", "admin"]}>
                <HODDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="superintendent-dashboard"
            element={
              <RoleRoute allowedRoles={["superintendent", "admin"]}>
                <SuperintendentDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="hr-dashboard"
            element={
              <RoleRoute allowedRoles={["hr", "admin"]}>
                <HRDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="reports-dashboard"
            element={
              <RoleRoute allowedRoles={["hr", "superintendent", "hod", "admin"]}>
                <ReportsDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="workers"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Workers />
              </RoleRoute>
            }
          />

          <Route
            path="users"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <UserManagement />
              </RoleRoute>
            }
          />

          <Route path="change-password" element={<ChangePassword />} />
        </Route>

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}