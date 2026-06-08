import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";

function UserManagement() {
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "shift_incharge",
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);

      toast.error("Failed to Load Users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      return toast.warning("Please fill all fields");
    }

    const emailExists = users.some(
      (user) =>
        user.email.toLowerCase() ===
        form.email.toLowerCase()
    );

    if (emailExists) {
      return toast.warning("Email already exists");
    }

    try {
      await api.post("/users", form);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "shift_incharge",
      });

      fetchUsers();

      toast.success("User Added Successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Failed to Add User"
      );
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/users/${id}`);

      toast.success(
        "User Deleted Successfully"
      );

      fetchUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Failed to Delete User"
      );
    }
  };

  const updateRole = async (id, role) => {
    const result = await Swal.fire({
      title: "Update User Role?",
      text: `Change role to ${role}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Update",
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/users/${id}`, {
        role,
      });

      toast.success(
        "Role Updated Successfully"
      );

      fetchUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Failed to Update Role"
      );
    }
  };

  const resetPassword = async (id) => {

  const { value: password } = await Swal.fire({
    title: "Reset Password",
    input: "password",
    inputLabel: "Enter New Password",
    inputPlaceholder: "New Password",
    showCancelButton: true,
    confirmButtonText: "Reset",
  });

  if (!password) return;

  try {

    await api.put(
      `/users/${id}/reset-password`,
      { password }
    );

    toast.success(
      "Password Reset Successfully"
    );

  } catch (err) {

    toast.error(
      err.response?.data?.error ||
      "Failed to Reset Password"
    );

  }

};
  return (
    <div className="p-6 text-gray-900 dark:text-white">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          User Management
        </h1>

        <p className="text-gray-500 dark:text-gray-300 mt-1">
          Manage system users and roles
        </p>
      </div>

      {/* Add User Card */}
      <div
        className="
        bg-white
        dark:bg-gray-800
        rounded-xl
        shadow-md
        p-6
        mb-6
        "
      >
        <h2 className="text-xl font-semibold mb-4">
          Add New User
        </h2>

        <form
          onSubmit={addUser}
          className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-5
          gap-4
          "
        >
          <input
            type="text"
            placeholder="Full Name"
            className="
            border
            border-gray-300
            dark:border-gray-600
            bg-white
            dark:bg-gray-700
            text-gray-900
            dark:text-white
            rounded-lg
            px-4
            py-3
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            "
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            className="
            border
            border-gray-300
            dark:border-gray-600
            bg-white
            dark:bg-gray-700
            text-gray-900
            dark:text-white
            rounded-lg
            px-4
            py-3
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            "
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="
            border
            border-gray-300
            dark:border-gray-600
            bg-white
            dark:bg-gray-700
            text-gray-900
            dark:text-white
            rounded-lg
            px-4
            py-3
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            "
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <select
            className="
            border
            border-gray-300
            dark:border-gray-600
            bg-white
            dark:bg-gray-700
            text-gray-900
            dark:text-white
            rounded-lg
            px-4
            py-3
            "
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          >
            <option value="shift_incharge">
              Shift Incharge
            </option>
            <option value="hod">HOD</option>
            <option value="superintendent">
              Superintendent
            </option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            font-medium
            rounded-lg
            px-4
            py-3
            transition
            "
          >
            Add User
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div
        className="
        bg-white
        dark:bg-gray-800
        rounded-xl
        shadow-md
        p-6
        "
      >
        <h2 className="text-xl font-semibold mb-4">
          System Users
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-3 text-left">
                  Name
                </th>
                <th className="px-4 py-3 text-left">
                  Email
                </th>
                <th className="px-4 py-3 text-left">
                  Current Role
                </th>
                <th className="px-4 py-3 text-left">
                  Change Role
                </th>
                <th className="px-4 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="
                  border-b
                  border-gray-200
                  dark:border-gray-700
                  hover:bg-gray-50
                  dark:hover:bg-gray-700
                  "
                >
                  <td className="px-4 py-3">
                    {user.name}
                  </td>

                  <td className="px-4 py-3">
                    {user.email}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : user.role === "hr"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "hod"
                          ? "bg-yellow-100 text-yellow-700"
                          : user.role === "superintendent"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role
                        .replace("_", " ")
                        .toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      className="
                      border
                      border-gray-300
                      dark:border-gray-600
                      bg-white
                      dark:bg-gray-700
                      text-gray-900
                      dark:text-white
                      rounded-lg
                      px-3
                      py-2
                      "
                      value={user.role}
                      onChange={(e) =>
                        updateRole(
                          user.id,
                          e.target.value
                        )
                      }
                    >
                      <option value="shift_incharge">
                        Shift Incharge
                      </option>
                      <option value="hod">HOD</option>
                      <option value="superintendent">
                        Superintendent
                      </option>
                      <option value="hr">HR</option>
                      <option value="admin">
                        Admin
                      </option>
                    </select>
                  </td>

                <td className="px-4 py-3 text-center">

  <div className="flex gap-2 justify-center">

    <button
      onClick={() =>
        resetPassword(user.id)
      }
      className="
      bg-yellow-500
      hover:bg-yellow-600
      text-white
      px-3
      py-2
      rounded-lg
      transition
      "
    >
      Reset Password
    </button>

    {user.role !== "admin" && (
      <button
        onClick={() =>
          deleteUser(user.id)
        }
        className="
        bg-red-500
        hover:bg-red-600
        text-white
        px-3
        py-2
        rounded-lg
        transition
        "
      >
        Delete
      </button>
    )}

  </div>

</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;