import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";
import Swal from "sweetalert2";

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingWorker, setEditingWorker] = useState(null);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const res = await api.get("/workers");
      setWorkers(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to Load Workers");
    }
  };

  const addWorker = async (e) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      return toast.warning("Please fill all fields");
    }

    try {
      await api.post("/workers", {
        name,
        code,
      });

      toast.success("Worker Added Successfully");

      setName("");
      setCode("");

      loadWorkers();
    } catch (err) {
      console.log(err);

      toast.error(
        err.response?.data?.error ||
          "Failed to Add Worker"
      );
    }
  };

  const updateWorker = async (e) => {
    e.preventDefault();

    try {
      await api.put(
        `/workers/${editingWorker.id}`,
        {
          name,
          code,
        }
      );

      toast.success(
        "Worker Updated Successfully"
      );

      setEditingWorker(null);
      setName("");
      setCode("");

      loadWorkers();
    } catch (err) {
      console.log(err);

      toast.error(
        err.response?.data?.error ||
          "Failed to Update Worker"
      );
    }
  };

  const deleteWorker = async (id) => {
    const result = await Swal.fire({
      title: "Delete Worker?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/workers/${id}`);

      toast.success(
        "Worker Deleted Successfully"
      );

      loadWorkers();
    } catch (err) {
      console.log(err);

      toast.error(
        err.response?.data?.error ||
          "Failed to Delete Worker"
      );
    }
  };

  const editWorker = (worker) => {
    setEditingWorker(worker);
    setName(worker.name);
    setCode(worker.code);
  };

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      worker.code
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-gray-900 dark:text-white">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Worker Management
        </h1>

        <p className="text-gray-500 dark:text-gray-300 mt-1">
          Add, update and manage workers
        </p>
      </div>

      {/* Add / Update Worker Form */}
      <form
        onSubmit={
          editingWorker
            ? updateWorker
            : addWorker
        }
        className="
        bg-white
        dark:bg-gray-800
        p-6
        rounded-2xl
        shadow-lg
        mb-6
        "
      >
        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Worker Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="
            border
            border-gray-300
            dark:border-gray-600
            bg-white
            dark:bg-gray-700
            text-gray-900
            dark:text-white
            p-3
            rounded-lg
            focus:ring-2
            focus:ring-blue-500
            "
            required
          />

          <input
            type="text"
            placeholder="Worker Code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            className="
            border
            border-gray-300
            dark:border-gray-600
            bg-white
            dark:bg-gray-700
            text-gray-900
            dark:text-white
            p-3
            rounded-lg
            focus:ring-2
            focus:ring-blue-500
            "
            required
          />
        </div>

        <div className="mt-4 flex gap-3">

          <button
            className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-2
            rounded-lg
            transition
            "
          >
            {editingWorker
              ? "Update Worker"
              : "Add Worker"}
          </button>

          {editingWorker && (
            <button
              type="button"
              onClick={() => {
                setEditingWorker(null);
                setName("");
                setCode("");
              }}
              className="
              bg-gray-500
              hover:bg-gray-600
              text-white
              px-5
              py-2
              rounded-lg
              transition
              "
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Worker List */}
      <div
        className="
        bg-white
        dark:bg-gray-800
        rounded-2xl
        shadow-lg
        p-6
        "
      >
        <input
          type="text"
          placeholder="Search Worker by Name or Code..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
          border
          border-gray-300
          dark:border-gray-600
          bg-white
          dark:bg-gray-700
          text-gray-900
          dark:text-white
          p-3
          rounded-lg
          mb-4
          w-full
          "
        />

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr
                className="
                border-b
                bg-gray-100
                dark:bg-gray-700
                "
              >
                <th className="p-4 text-left">
                  Code
                </th>

                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredWorkers.length > 0 ? (

                filteredWorkers.map((worker) => (

                  <tr
                    key={worker.id}
                    className="
                    border-b
                    border-gray-200
                    dark:border-gray-700
                    hover:bg-blue-50
                    dark:hover:bg-gray-700
                    transition
                    "
                  >
                    <td className="p-4">
                      {worker.code}
                    </td>

                    <td className="p-4">
                      {worker.name}
                    </td>

                    <td className="p-4 flex gap-2">

                      <button
                        onClick={() =>
                          editWorker(worker)
                        }
                        className="
                        bg-yellow-500
                        hover:bg-yellow-600
                        text-white
                        px-3
                        py-1
                        rounded
                        "
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteWorker(worker.id)
                        }
                        className="
                        bg-red-600
                        hover:bg-red-700
                        text-white
                        px-3
                        py-1
                        rounded
                        "
                      >
                        Delete
                      </button>

                    </td>
                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan="3"
                    className="
                    text-center
                    p-6
                    text-gray-500
                    dark:text-gray-400
                    "
                  >
                    No Workers Found
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