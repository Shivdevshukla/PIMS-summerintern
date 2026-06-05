import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Sidebar() {

  const { user } = useSelector(
    (state) => state.auth
  );

  return (
    <div
      className="
      w-64
      bg-white
      shadow-lg
      min-h-screen
      "
    >

      {/* Logo */}

      <div className="p-5 border-b">

        <h2
          className="
          text-2xl
          font-bold
          text-blue-700
          "
        >
          PIMS
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {user?.role
            ?.replace("_", " ")
            .toUpperCase()}
        </p>

      </div>

      {/* Menu */}

      <div className="p-3 space-y-1">

        <NavLink
          to="/"
          className="block p-3 rounded hover:bg-blue-50"
        >
          Dashboard
        </NavLink>

        {/* Shift Incharge */}

        {user?.role === "shift_incharge" && (
          <NavLink
            to="/create-entry"
            className="block p-3 rounded hover:bg-blue-50"
          >
            Create Entry
          </NavLink>
        )}

        {/* HOD */}

        {user?.role === "hod" && (
          <NavLink
            to="/hod-dashboard"
            className="block p-3 rounded hover:bg-blue-50"
          >
            HOD Dashboard
          </NavLink>
        )}

        {/* Superintendent */}

        {user?.role ===
          "superintendent" && (
          <NavLink
            to="/superintendent-dashboard"
            className="block p-3 rounded hover:bg-blue-50"
          >
            Superintendent Dashboard
          </NavLink>
        )}

        {/* HR */}

        {user?.role === "hr" && (
          <>
            <NavLink
              to="/hr-dashboard"
              className="block p-3 rounded hover:bg-blue-50"
            >
              HR Dashboard
            </NavLink>

            <NavLink
              to="/reports-dashboard"
              className="block p-3 rounded hover:bg-blue-50"
            >
              Reports Dashboard
            </NavLink>
          </>
        )}

        {/* Admin */}

        {user?.role === "admin" && (
          <>
            <NavLink
              to="/reports-dashboard"
              className="block p-3 rounded hover:bg-blue-50"
            >
              Reports Dashboard
            </NavLink>

            <NavLink
              to="/workers"
              className="block p-3 rounded hover:bg-blue-50"
            >
              Worker Management
            </NavLink>
          </>
        )}

      </div>

    </div>
  );
}