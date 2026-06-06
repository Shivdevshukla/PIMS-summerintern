import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";
import Swal from "sweetalert2";

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

      toast.error(
        "Failed to Load Entries"
      );
    }
  };

  const approveEntry = async (entry) => {

  const result = await Swal.fire({
    title: "Final Approval?",
    text: "This will complete the workflow and approve the incentive.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Approve",
  });

  if (!result.isConfirmed) return;

  try {

    await api.put(
      `/approvals/hr/${entry.id}`,
      {
        action: "approve",
        remarks: "Approved by HR",
        incentive_amount:
          entry.incentive_amount,
      }
    );

    toast.success(
      "Final Approval Completed"
    );

    loadEntries();

  } catch (err) {

    console.log(err);

    toast.error(
      "Approval Failed"
    );
  }
};

  const rejectEntry = async (entry) => {

  const result = await Swal.fire({
    title: "Reject Entry?",
    text: "This entry will be rejected.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Reject",
  });

  if (!result.isConfirmed) return;

  try {

    await api.put(
      `/approvals/hr/${entry.id}`,
      {
        action: "reject",
        remarks: "Rejected by HR",
        incentive_amount:
          entry.incentive_amount,
      }
    );

    toast.error(
      "Entry Rejected By HR"
    );

    loadEntries();

  } catch (err) {

    console.log(err);

    toast.error(
      "Rejection Failed"
    );
  }
};

  return (
    <div>

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          HR Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Final approval and incentive verification
        </p>

      </div>

      <div
        className="
        bg-white
        rounded-2xl
        shadow-lg
        p-6
        "
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-gray-100 border-b">

                <th className="p-4 text-left">
                  OC Number
                </th>

                <th className="p-4 text-left">
                  Quantity
                </th>

                <th className="p-4 text-left">
                  Incentive
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Action
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
                    transition
                    "
                  >

                    <td className="p-4">
                      {entry.oc_number}
                    </td>

                    <td className="p-4">
                      {entry.production_quantity}
                    </td>

                    <td className="p-4 font-medium text-green-600">
                      ₹{entry.incentive_amount}
                    </td>

                    <td className="p-4">

                      <span
                        className="
                        bg-purple-100
                        text-purple-700
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        font-medium
                        "
                      >
                        Pending HR
                      </span>

                    </td>

                    <td className="p-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            approveEntry(entry)
                          }
                          className="
                          bg-green-600
                          hover:bg-green-700
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          transition
                          "
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            rejectEntry(entry)
                          }
                          className="
                          bg-red-600
                          hover:bg-red-700
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          transition
                          "
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
                    className="
                    text-center
                    p-10
                    text-gray-500
                    "
                  >
                    No Pending HR Approvals
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