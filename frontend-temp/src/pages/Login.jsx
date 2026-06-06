import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.warning(
        "Please enter email and password"
      );
    }

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      dispatch(login(res.data));

      toast.success("Login Successful");

      navigate("/");

    } catch (err) {

      toast.error(
        err.response?.data?.error ||
        "Invalid Email or Password"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <div className="text-center mb-6">

          <h1 className="text-3xl font-bold text-blue-700">
            PIMS
          </h1>

          <p className="text-gray-500 mt-2">
            Production Incentive Management System
          </p>

        </div>

        <form
          onSubmit={submit}
          className="space-y-4"
        >

          <div>

            <label className="block text-sm font-medium mb-1">
              Email
            </label>

            <input
              type="email"
              className="
              w-full
              border
              border-gray-300
              rounded-lg
              px-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              "
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-1">
              Password
            </label>

            <input
              type="password"
              className="
              w-full
              border
              border-gray-300
              rounded-lg
              px-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              "
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            text-white
            py-3
            rounded-lg
            font-medium
            transition
            disabled:bg-gray-400
            "
          >
            {loading
              ? "Logging In..."
              : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}
