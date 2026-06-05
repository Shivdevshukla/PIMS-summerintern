import { useEffect, useState } from "react";
import api from "../api";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function ReportsDashboard() {

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    incentive: 0,
  });

  const [monthlyStats, setMonthlyStats] = useState({
    labels: [],
    values: [],
  });

  const [machineStats, setMachineStats] = useState({
  labels: [],
  values: [],
});

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {

      const res = await api.get("/entries");

      const entries = res.data;

      const approved =
        entries.filter(
          (e) => e.status === "approved"
        ).length;

      const rejected =
        entries.filter(
          (e) => e.status === "rejected"
        ).length;

      const totalIncentive =
        entries.reduce(
          (sum, e) =>
            sum + Number(e.incentive_amount || 0),
          0
        );

      const monthlyData = {};
const machineData = {};

    entries.forEach((entry) => {

  const month = new Date(
    entry.created_at
  ).toLocaleString("default", {
    month: "short",
  });

  monthlyData[month] =
    (monthlyData[month] || 0) + 1;

  const machine =
    entry.machine_id || "Unknown";

  machineData[machine] =
    (machineData[machine] || 0) +
    Number(entry.production_quantity || 0);

});

      setStats({
        total: entries.length,
        approved,
        rejected,
        incentive: totalIncentive,
      });

      setMonthlyStats({
        labels: Object.keys(monthlyData),
        values: Object.values(monthlyData),
      });

      setMachineStats({
  labels: Object.keys(machineData),
  values: Object.values(machineData),
});

    } catch (err) {
      console.log(err);
    }
  };

  const exportExcel = () => {
    window.open(
      "http://localhost:5000/api/export/excel",
      "_blank"
    );
  };

  const pending =
    stats.total -
    stats.approved -
    stats.rejected;

  const pieData = {
    labels: [
      "Approved",
      "Rejected",
      "Pending",
    ],

    datasets: [
      {
        data: [
          stats.approved,
          stats.rejected,
          pending,
        ],

        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#f59e0b",
        ],

        borderColor: [
          "#16a34a",
          "#dc2626",
          "#d97706",
        ],

        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: [
      "Total",
      "Approved",
      "Rejected",
      "Pending",
    ],

    datasets: [
      {
        label: "Entries",

        data: [
          stats.total,
          stats.approved,
          stats.rejected,
          pending,
        ],

        backgroundColor: [
          "#3b82f6",
          "#22c55e",
          "#ef4444",
          "#f59e0b",
        ],

        borderRadius: 8,
      },
    ],
  };

  const monthlyChartData = {
    
    labels: monthlyStats.labels,

    datasets: [
      {
        label: "Monthly Entries",

        data: monthlyStats.values,

        backgroundColor: "#3b82f6",

        borderRadius: 8,
      },
    ],
  };

  const machineChartData = {
  labels: machineStats.labels,

  datasets: [
    {
      label: "Production Quantity",

      data: machineStats.values,

      backgroundColor: "#8b5cf6",

      borderRadius: 8,
    },
  ],
};
  return (
    <div>

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

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
          Reports Dashboard
        </h1>

        <button
          onClick={exportExcel}
          className="
          bg-green-600
          hover:bg-green-700
          text-white
          px-5
          py-3
          rounded-lg
          shadow-md
          transition
          "
        >
          Export Excel Report
        </button>

      </div>

      {/* Stats Cards */}

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-gray-500">
            Total Entries
          </h3>

          <p className="text-4xl font-bold mt-3">
            {stats.total}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-gray-500">
            Approved Entries
          </h3>

          <p className="text-4xl font-bold text-green-600 mt-3">
            {stats.approved}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-gray-500">
            Rejected Entries
          </h3>

          <p className="text-4xl font-bold text-red-600 mt-3">
            {stats.rejected}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-gray-500">
            Total Incentive
          </h3>

          <p className="text-4xl font-bold text-blue-600 mt-3">
            ₹{stats.incentive}
          </p>
        </div>

      </div>

      {/* Charts Row */}

      <div className="grid lg:grid-cols-2 gap-8 mt-10">

        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl font-semibold mb-4">
            Approval Distribution
          </h2>

          <div className="h-80">

            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h2 className="text-xl font-semibold mb-4">
            Entry Statistics
          </h2>

          <div className="h-80">

            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />

          </div>

        </div>

      </div>

      {/* Monthly Chart */}

      <div
        className="
        bg-white
        rounded-2xl
        shadow-lg
        p-6
        mt-10
        "
      >

        <h2 className="text-xl font-semibold mb-4">
          Monthly Production Entries
        </h2>

        <div className="h-96">

          <Bar
            data={monthlyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />

        </div>

      </div>

{/* Machine-wise Production */}

<div
  className="
  bg-white
  rounded-2xl
  shadow-lg
  p-6
  mt-10
  "
>

  <h2 className="text-xl font-semibold mb-4">
    Machine-wise Production
  </h2>

  <div className="h-96">

    <Bar
      data={machineChartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
      }}
    />

  </div>

</div>
    </div>
  );
}