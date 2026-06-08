import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import api from "../api";

export default function CreateEntry() {
  const [workers, setWorkers] = useState([]);

  const [form, setForm] = useState({
    worker_id: "",
    oc_number: "",
    oc_stage: "",
    machine_id: "",
    shift: "",
    production_quantity: "",
    incentive_rate: 5,
    incentive_amount: 0,
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    const quantity =
      Number(form.production_quantity) || 0;

    const rate =
      Number(form.incentive_rate) || 0;

    setForm((prev) => ({
      ...prev,
      incentive_amount: quantity * rate,
    }));
  }, [
    form.production_quantity,
    form.incentive_rate,
  ]);

  const loadWorkers = async () => {
  try {
    const res = await api.get("/workers");
    setWorkers(res.data);
  } catch (err) {
    toast.error(
      "Failed to Load Workers"
    );
  }
};
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitEntry = async (e) => {
  e.preventDefault();

  if (
    !form.worker_id ||
    !form.oc_number ||
    !form.oc_stage ||
    !form.machine_id ||
    !form.shift ||
    !form.production_quantity
  ) {
    return toast.warning(
      "Please fill all required fields"
    );
  }

  try {
    await api.post("/entries", form);

    toast.success(
      "Production Entry Submitted Successfully"
    );

    setForm({
      worker_id: "",
      oc_number: "",
      oc_stage: "",
      machine_id: "",
      shift: "",
      production_quantity: "",
      incentive_rate: 5,
      incentive_amount: 0,
    });

  } catch (err) {

    console.log(err);

    toast.error(
      err.response?.data?.error ||
      "Submission Failed"
    );
  }
};

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6text-gray-900 dark:text-white">
        Create Production Entry
      </h1>

      <form
  onSubmit={submitEntry}
  className="
  bg-white
  dark:bg-slate-800
  rounded-xl
  shadow
  p-6
  text-gray-900
  dark:text-white
  "
>
        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">
              Worker
            </label>

            <select
              name="worker_id"
              value={form.worker_id}
              onChange={handleChange}
              className="
border
border-gray-300
dark:border-slate-600
bg-white
dark:bg-slate-700
text-gray-900
dark:text-white
p-3
rounded
w-full
"
            >
              <option value="">
                Select Worker
              </option>

              {workers.map((worker) => (
                <option
                  key={worker.id}
                  value={worker.id}
                >
                  {worker.name} ({worker.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">
              OC Number
            </label>

            <input
              type="text"
              name="oc_number"
              value={form.oc_number}
              onChange={handleChange}
              className="
border
border-gray-300
dark:border-slate-600
bg-white
dark:bg-slate-700
text-gray-900
dark:text-white
p-3
rounded
w-full
"
            />
          </div>

          <div>
            <label className="block mb-2">
              OC Stage
            </label>

            <input
              type="text"
              name="oc_stage"
              value={form.oc_stage}
              onChange={handleChange}
              className="
border
border-gray-300
dark:border-slate-600
bg-white
dark:bg-slate-700
text-gray-900
dark:text-white
p-3
rounded
w-full
"
            />
          </div>

          <div>
            <label className="block mb-2">
              Machine ID
            </label>

            <input
              type="text"
              name="machine_id"
              value={form.machine_id}
              onChange={handleChange}
              className="
border
border-gray-300
dark:border-slate-600
bg-white
dark:bg-slate-700
text-gray-900
dark:text-white
p-3
rounded
w-full
"
            />
          </div>

          <div>
            <label className="block mb-2">
              Shift
            </label>

            <select
              name="shift"
              value={form.shift}
              onChange={handleChange}
              className="
border
border-gray-300
dark:border-slate-600
bg-white
dark:bg-slate-700
text-gray-900
dark:text-white
p-3
rounded
w-full
"
            >
              <option value="">
                Select Shift
              </option>

              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">
              Production Quantity
            </label>

            <input
              type="number"
              name="production_quantity"
              value={form.production_quantity}
              onChange={handleChange}
              className="
border
border-gray-300
dark:border-slate-600
bg-white
dark:bg-slate-700
text-gray-900
dark:text-white
p-3
rounded
w-full
"
            />
          </div>

          <div>
            <label className="block mb-2">
              Incentive Rate
            </label>

            <input
              type="number"
              name="incentive_rate"
              value={form.incentive_rate}
              onChange={handleChange}
              className="
border
border-gray-300
dark:border-slate-600
bg-white
dark:bg-slate-700
text-gray-900
dark:text-white
p-3
rounded
w-full
"
            />
          </div>

          <div>
            <label className="block mb-2">
              Incentive Amount
            </label>

            <input
              type="number"
              readOnly
              name="incentive_amount"
              value={form.incentive_amount}
              className="
border
border-gray-300
dark:border-slate-600
p-3
rounded
w-full
bg-gray-100
dark:bg-slate-700
text-gray-900
dark:text-white
"
            />
          </div>

        </div>

        <button
          type="submit"
         className="
mt-6
bg-blue-600
hover:bg-blue-700
text-white
px-6
py-3
rounded-lg
transition
"
        >
          Submit Entry
        </button>
      </form>
    </div>
  );
}