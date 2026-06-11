import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login                  from "./pages/Login";
import Dashboard              from "./pages/Dashboard";
import CreateEntry            from "./pages/CreateEntry";
import Layout                 from "./components/Layout";
import HODDashboard           from "./pages/HODDashboard";
import SuperintendentDashboard from "./pages/SuperintendentDashboard";
import HRDashboard            from "./pages/HRDashboard";
import ReportsDashboard       from "./pages/ReportsDashboard";
import Workers                from "./pages/Workers";
import UserManagement         from "./pages/UserManagement";
import ChangePassword         from "./pages/ChangePassword";
import ActivityLog            from "./pages/ActivityLog"; // NEW

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" />;
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
          <Route index                          element={<Dashboard />} />
          <Route path="create-entry"            element={<CreateEntry />} />
          <Route path="hod-dashboard"           element={<HODDashboard />} />
          <Route path="superintendent-dashboard" element={<SuperintendentDashboard />} />
          <Route path="hr-dashboard"            element={<HRDashboard />} />
          <Route path="reports-dashboard"       element={<ReportsDashboard />} />
          <Route path="workers"                 element={<Workers />} />
          <Route path="users"                   element={<UserManagement />} />
          <Route path="change-password"         element={<ChangePassword />} />
          <Route path="activity-log"            element={<ActivityLog />} />  {/* NEW */}
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