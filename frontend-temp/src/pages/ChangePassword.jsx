import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

function ChangePassword() {

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      return toast.error(
        "Passwords do not match"
      );
    }

    try {

      const res = await api.put(
        "/users/change-password",
        {
          currentPassword:
            form.currentPassword,
          newPassword:
            form.newPassword,
        }
      );

      toast.success(
        res.data.message
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (err) {

      toast.error(
        err.response?.data?.error ||
        "Failed to Change Password"
      );

    }

  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">

      <h2 className="text-2xl font-bold mb-6">
        Change Password
      </h2>

      <form onSubmit={handleSubmit}>

        <input
          type="password"
          placeholder="Current Password"
          className="w-full border rounded-lg p-3 mb-4"
          value={form.currentPassword}
          onChange={(e) =>
            setForm({
              ...form,
              currentPassword:
                e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full border rounded-lg p-3 mb-4"
          value={form.newPassword}
          onChange={(e) =>
            setForm({
              ...form,
              newPassword:
                e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border rounded-lg p-3 mb-4"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({
              ...form,
              confirmPassword:
                e.target.value,
            })
          }
        />

        <button
          type="submit"
          className="
          w-full
          bg-blue-600
          hover:bg-blue-700
          text-white
          py-3
          rounded-lg
          "
        >
          Change Password
        </button>

      </form>
    </div>
  );
}

export default ChangePassword;