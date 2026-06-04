import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
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
    } catch (err) {
      console.log("Dashboard Error:", err);
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Shift Incharge Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Production Incentive Management Overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500 text-sm">
            Total Entries
          </h3>

          <p className="text-3xl font-bold mt-2">
            {stats.totalEntries}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500 text-sm">
            Pending Approval
          </h3>

          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {stats.pending}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500 text-sm">
            Approved
          </h3>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats.approved}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-gray-500 text-sm">
            Total Incentive
          </h3>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            ₹{stats.totalIncentive}
          </p>
        </div>
      </div>

      {/* Approval Workflow */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Approval Workflow
        </h2>

        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm">Submitted</p>
          </div>

          <div>➜</div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-500 mx-auto"></div>
            <p className="mt-2 text-sm">HOD</p>
          </div>

          <div>➜</div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500 mx-auto"></div>
            <p className="mt-2 text-sm">Superintendent</p>
          </div>

          <div>➜</div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500 mx-auto"></div>
            <p className="mt-2 text-sm">HR</p>
          </div>
        </div>
      </div>

      {/* Recent Entries Table */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Recent Production Entries
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">
                  OC Number
                </th>

                <th className="p-3 text-left">
                  Machine
                </th>

                <th className="p-3 text-left">
                  Status
                </th>

                <th className="p-3 text-left">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">
                      {entry.oc_number}
                    </td>

                    <td className="p-3">
                      {entry.machine_id}
                    </td>

                    <td className="p-3">
                      {entry.status}
                    </td>

                    <td className="p-3">
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
                    className="text-center p-6 text-gray-500"
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