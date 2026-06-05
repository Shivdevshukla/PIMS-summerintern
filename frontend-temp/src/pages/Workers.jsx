import { useEffect, useState } from "react";
import api from "../api";

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
    }
  };

  const addWorker = async (e) => {
    e.preventDefault();

    try {

      await api.post("/workers", {
        name,
        code,
      });

      setName("");
      setCode("");

      loadWorkers();

      alert("Worker Added");

    } catch (err) {
      console.log(err);
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

      alert("Worker Updated");

      setEditingWorker(null);
      setName("");
      setCode("");

      loadWorkers();

    } catch (err) {
      console.log(err);
    }
  };

  const deleteWorker = async (id) => {
    try {

      await api.delete(`/workers/${id}`);

      alert("Worker Deleted");

      loadWorkers();

    } catch (err) {
      console.log(err);
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
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Worker Management
      </h1>

      {/* Add / Update Worker Form */}

      <form
        onSubmit={
          editingWorker
            ? updateWorker
            : addWorker
        }
        className="
        bg-white
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
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Worker Code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            className="border p-3 rounded-lg"
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
          p-3
          rounded-lg
          mb-4
          w-full
          "
        />

        <table className="w-full">

          <thead>

            <tr className="border-b bg-gray-100">

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
                  hover:bg-blue-50
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
  );
}