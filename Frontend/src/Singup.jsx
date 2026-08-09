import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const obj = {};
    if (!signupData.name.trim()) obj.name = "Name is required";
    if (!signupData.email.trim()) obj.email = "Email is required";
    if (!signupData.password) obj.password = "Password is required";
    return obj;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/task/singup`,
        signupData
      );

      alert(result?.data?.message || "Account created successfully!");

      if (result.status === 201 || result.status === 200) {
        setSignupData({
          name: "",
          email: "",
          password: "",
        });
        navigate("/login");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Signup failed";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 transition-colors duration-200 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Create account
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Set up your task manager profile.
            </p>
          </div>

          {/* Name Field */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-bold text-teal-700 dark:text-teal-400">
              Name
            </label>
            <input
              name="name"
              value={signupData.name}
              onChange={handleChange}
              type="text"
              placeholder="John Doe"
              className="rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-400"
            />
            {errors.name && (
              <p className="mt-1 text-xs font-semibold text-rose-500">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-bold text-teal-700 dark:text-teal-400">
              Email
            </label>
            <input
              name="email"
              value={signupData.email}
              onChange={handleChange}
              type="email"
              placeholder="name@example.com"
              className="rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-400"
            />
            {errors.email && (
              <p className="mt-1 text-xs font-semibold text-rose-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-bold text-teal-700 dark:text-teal-400">
              Password
            </label>
            <input
              name="password"
              value={signupData.password}
              onChange={handleChange}
              type="password"
              placeholder="••••••••"
              className="rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-400"
            />
            {errors.password && (
              <p className="mt-1 text-xs font-semibold text-rose-500">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>

          {/* Navigation to Login */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;