import { useEffect, useState } from "react";
import api from "../api";

export default function HRDashboard() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const res = await api.get("/entries");

      const pendingEntries = res.data.filter(
        (entry) => entry.status === "pending_hr"
      );

      setEntries(pendingEntries);

    } catch (err) {
      console.log(err);
    }
  };

  const approveEntry = async (entry) => {
    try {

      await api.put(
        `/approvals/hr/${entry.id}`,
        {
          action: "approve",
          remarks: "Approved by HR",
          incentive_amount: entry.incentive_amount
        }
      );

      alert("Final Approval Completed");

      loadEntries();

    } catch (err) {
      console.log(err);
    }
  };

  const rejectEntry = async (entry) => {
    try {

      await api.put(
        `/approvals/hr/${entry.id}`,
        {
          action: "reject",
          remarks: "Rejected by HR",
          incentive_amount: entry.incentive_amount
        }
      );

      alert("Entry Rejected");

      loadEntries();

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        HR Dashboard
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="p-3">OC Number</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Incentive</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b">

                <td className="p-3">
                  {entry.oc_number}
                </td>

                <td className="p-3">
                  {entry.production_quantity}
                </td>

                <td className="p-3">
                  ₹{entry.incentive_amount}
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
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}