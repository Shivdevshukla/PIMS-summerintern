import { useEffect, useState } from "react";
import api from "../api";

export default function HODDashboard() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const res = await api.get("/entries");

      const pendingEntries = res.data.filter(
        (entry) => entry.status === "pending_hod"
      );

      setEntries(pendingEntries);

    } catch (err) {
      console.log(err);
    }
  };

  const approveEntry = async (entry) => {
    try {
      await api.put(
        `/approvals/hod/${entry.id}`,
        {
          action: "approve",
          remarks: "Approved by HOD",
          production_quantity: entry.production_quantity
        }
      );

      alert("Entry Approved");

      loadEntries();

    } catch (err) {
      console.log(err);
      alert("Approval Failed");
    }
  };

  const rejectEntry = async (entry) => {
    try {
      await api.put(
        `/approvals/hod/${entry.id}`,
        {
          action: "reject",
          remarks: "Rejected by HOD",
          production_quantity: entry.production_quantity
        }
      );

      alert("Entry Rejected");

      loadEntries();

    } catch (err) {
      console.log(err);
      alert("Rejection Failed");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        HOD Dashboard
      </h1>

      <div className="bg-white rounded-xl shadow p-6">

        <table className="w-full">

          <thead>
            <tr className="border-b bg-gray-50">

              <th className="p-3 text-left">
                OC Number
              </th>

              <th className="p-3 text-left">
                Worker
              </th>

              <th className="p-3 text-left">
                Quantity
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            {entries.length > 0 ? (
              entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b"
                >

                  <td className="p-3">
                    {entry.oc_number}
                  </td>

                  <td className="p-3">
                    {entry.worker_name || entry.worker_id}
                  </td>

                  <td className="p-3">
                    {entry.production_quantity}
                  </td>

                  <td className="p-3">
                    {entry.status}
                  </td>

                  <td className="p-3">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          approveEntry(entry)
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectEntry(entry)
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Reject
                      </button>

                    </div>

                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-6 text-gray-500"
                >
                  No Pending HOD Approvals
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}