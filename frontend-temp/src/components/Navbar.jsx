import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/store";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

export default function Navbar() {

  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth
  );

  return (
    <div
      className="
      bg-gradient-to-r
      from-blue-700
      to-indigo-700
      text-white
      px-6
      py-4
      shadow-lg
      flex
      justify-between
      items-center
      "
    >

      <div>
        <h1 className="font-bold text-2xl">
          Production Incentive Management System
        </h1>

        <p className="text-sm text-blue-100">
          Industrial Workflow Management
        </p>
      </div>

      <div className="flex items-center gap-5">

        <div className="flex items-center gap-2">
          <FaUserCircle size={24} />

          <div>
            <p className="font-medium">
              {user?.name}
            </p>

            <p className="text-xs text-blue-100">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch(logout())}
          className="
          bg-red-500
          hover:bg-red-600
          px-4
          py-2
          rounded-lg
          transition
          flex
          items-center
          gap-2
          "
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>

    </div>
  );
}