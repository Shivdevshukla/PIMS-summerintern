import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api";

import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaMoneyBillWave,
  FaUserCircle,
} from "react-icons/fa";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalEntries: 0,
    pending: 0,
    approved: 0,
    totalIncentive: 0,
  });

  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadStats();
    loadRecentEntries();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.log("Dashboard Error:", err);
      setLoading(false);
    }
  };

  const loadRecentEntries = async () => {
    try {
      const res = await api.get("/dashboard/recent");
      setEntries(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10 text-xl text-gray-900 dark:text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div>

      {/* Header */}

      <div className="mb-6">
        <h1
          className="
          text-4xl
          font-bold
          bg-gradient-to-r
          from-blue-700
          to-indigo-700
          bg-clip-text
          text-transparent
          "
        >
          Shift Incharge Dashboard
        </h1>

<p className="text-gray-500 dark:text-gray-400 mt-2">
          Production Incentive Management Overview
        </p>
      </div>

      {/* Welcome Card */}

      <div
        className="
        bg-gradient-to-r
        from-blue-700
        to-indigo-700
        text-white
        rounded-2xl
        p-6
        mb-8
        shadow-lg
        "
      >
        <div className="flex items-center gap-4">

          <FaUserCircle size={50} />

          <div>

            <h2 className="text-2xl font-bold">
              Welcome, {user?.name}
            </h2>

            <p className="text-blue-100">
              Role: {user?.role}
            </p>

            <p className="text-blue-100 mt-1">
              Manage production incentives and approvals efficiently.
            </p>

          </div>

        </div>
      </div>

      {/* Stats Cards */}

      <div
        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-6
        mb-8
        "
      >

        {/* Total Entries */}
<div
  className="
  bg-white
  dark:bg-slate-800
  rounded-2xl
  p-6
  shadow-lg
  hover:shadow-xl
  hover:-translate-y-1
  transition-all
  duration-300
  text-gray-900
  dark:text-white
  "
>
<div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
              <FaClipboardList />
            <h3>Total Entries</h3>
          </div>

          <p className="text-4xl font-bold mt-3">
            {stats.totalEntries}
          </p>
        </div>

        {/* Pending */}

        <div
          className="
          bg-white dark:bg-slate-800
          rounded-2xl
          p-6
          shadow-lg
          hover:shadow-xl
          hover:-translate-y-1
          transition-all
          duration-300
          "
        >
          <div className="flex items-center gap-2 text-gray-500">
            <FaClock />
            <h3>Pending Approval</h3>
          </div>

          <p className="text-4xl font-bold text-yellow-600 mt-3">
            {stats.pending}
          </p>
        </div>

        {/* Approved */}

        <div
  className="
  bg-white
  dark:bg-slate-800
  rounded-2xl
  p-6
  shadow-lg
  hover:shadow-xl
  hover:-translate-y-1
  transition-all
  duration-300
  text-gray-900
  dark:text-white
  "
>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
            <FaCheckCircle />
            <h3>Approved</h3>
          </div>

          <p className="text-4xl font-bold text-green-600 mt-3">
            {stats.approved}
          </p>
        </div>

        {/* Incentive */}

        <div
          className="
          bg-white dark:bg-slate-800
          rounded-2xl
          p-6
          shadow-lg
          hover:shadow-xl
          hover:-translate-y-1
          transition-all
          duration-300
          "
        >
          <div className="flex items-center gap-2 text-gray-500">
            <FaMoneyBillWave />
            <h3>Total Incentive</h3>
          </div>

          <p className="text-4xl font-bold text-blue-600 mt-3">
            ₹{stats.totalIncentive}
          </p>
        </div>

      </div>

      {/* Approval Workflow */}

<div
  className="
  bg-white dark:bg-slate-800
  dark:bg-slate-800
  rounded-2xl
  shadow-lg
  p-6
  text-gray-900
  dark:text-white
  "
>
        <h2 className="text-xl font-semibold mb-6">
          Approval Workflow
        </h2>

        <div className="flex items-center justify-between">

          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-blue-500 mx-auto"></div>
            <p className="mt-2 font-medium">Submitted</p>
          </div>

          <div className="text-2xl">➜</div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-yellow-500 mx-auto"></div>
            <p className="mt-2 font-medium">HOD</p>
          </div>

          <div className="text-2xl">➜</div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-purple-500 mx-auto"></div>
            <p className="mt-2 font-medium">
              Superintendent
            </p>
          </div>

          <div className="text-2xl">➜</div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-500 mx-auto"></div>
            <p className="mt-2 font-medium">HR</p>
          </div>

        </div>

      </div>

      {/* Recent Entries */}

      <div
        className="
        bg-white dark:bg-slate-800
        rounded-2xl
        shadow-lg
        p-6
        mt-8
        "
      >

        <h2 className="text-xl font-semibold mb-4">
          Recent Production Entries
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

<tr className="border-b bg-gray-100 dark:bg-slate-700">
                <th className="p-4 text-left">
                  OC Number
                </th>

                <th className="p-4 text-left">
                  Machine
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="
                    border-b
                    hover:bg-blue-50
                    dark:hover:bg-slate-700
                    transition
                    "
                  >
                    <td className="p-4">
                      {entry.oc_number}
                    </td>

                    <td className="p-4">
                      {entry.machine_id}
                    </td>

                    <td className="p-4">
                      {entry.status}
                    </td>

                    <td className="p-4">
                      {new Date(
                        entry.created_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="
                    text-center
                    p-6
                    text-gray-500
                    dark:text-gray-400
                    "
                  >
                    No entries found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}