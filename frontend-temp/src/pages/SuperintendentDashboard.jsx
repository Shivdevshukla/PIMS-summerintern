import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";
import Swal from "sweetalert2";

export default function SuperintendentDashboard() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const res = await api.get("/entries");

      const pendingEntries = res.data.filter(
        (entry) =>
          entry.status === "pending_superintendent"
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
    title: "Approve Entry?",
    text: "This entry will move to HR for final approval.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Approve",
  });

  if (!result.isConfirmed) return;

  try {

    await api.put(
      `/approvals/superintendent/${entry.id}`,
      {
        action: "approve",
        remarks: "Approved by Superintendent",
        production_quantity:
          entry.production_quantity,
      }
    );

    toast.success(
      "Entry Approved By Superintendent"
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
      `/approvals/superintendent/${entry.id}`,
      {
        action: "reject",
        remarks: "Rejected by Superintendent",
        production_quantity:
          entry.production_quantity,
      }
    );

    toast.error(
      "Entry Rejected By Superintendent"
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

<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Superintendent Dashboard
        </h1>

<p className="text-gray-500 dark:text-gray-400 mt-1">
            Review HOD approved production entries
        </p>

      </div>

      <div
  className="
  bg-white
  dark:bg-slate-800
  rounded-2xl
  shadow-lg
  p-6
  text-gray-900
  dark:text-white
  "
>

        <div className="overflow-x-auto">

          <table className="w-full text-gray-900 dark:text-white">

            <thead>

             <tr className="bg-gray-100 dark:bg-slate-700 border-b dark:border-slate-600">
                <th className="p-4 text-left">
                  OC Number
                </th>

                <th className="p-4 text-left">
                  Quantity
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
dark:border-slate-700
hover:bg-blue-50
dark:hover:bg-slate-700
transition
"
                  >

                    <td className="p-4">
                      {entry.oc_number}
                    </td>

                    <td className="p-4">
                      {entry.production_quantity}
                    </td>

                    <td className="p-4">

                      <span
                        className="
bg-blue-100
dark:bg-blue-900/30
text-blue-700
dark:text-blue-300
px-3
py-1
rounded-full
text-sm
font-medium
"
                      >
                        Pending Superintendent
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
dark:bg-green-500
dark:hover:bg-green-600
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
dark:bg-red-500
dark:hover:bg-red-600
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
                    colSpan="4"
                    className="
text-center
p-10
text-gray-500
dark:text-gray-400
"
                  >
                    No Pending Superintendent Approvals
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