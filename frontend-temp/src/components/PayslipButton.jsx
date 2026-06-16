import { useState } from "react";
import { toast } from "react-toastify";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import api from "../api";

export default function PayslipButton({ entryId, ocNumber, size = "sm", label = "PDF" }) {
  const [loading, setLoading] = useState(false);

  const downloadPayslip = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payslip/${entryId}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip-OC${ocNumber}-${entryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Payslip for OC #${ocNumber} downloaded`);
    } catch (err) {
      toast.error("Failed to generate payslip");
      console.error(err);
    }
    setLoading(false);
  };

  const base = "flex items-center gap-1.5 font-semibold transition-colors rounded-lg";
  const sizes = { sm: "text-xs px-2.5 py-1.5", md: "text-sm px-4 py-2" };

  return (
    <button
      onClick={downloadPayslip}
      disabled={loading}
      className={`${base} ${sizes[size]} bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 disabled:opacity-60`}
      title={`Download payslip for OC #${ocNumber}`}
    >
      {loading
        ? <FaSpinner size={size === "sm" ? 10 : 12} className="animate-spin" />
        : <FaFilePdf size={size === "sm" ? 10 : 12} />
      }
      {loading ? "Generating…" : label}
    </button>
  );
}