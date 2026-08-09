import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toggle, setToggle] = useState(false);

  const email = localStorage.getItem("email");
  const icon = email?.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("userid");
    localStorage.removeItem("token");
    setToggle(false);
    navigate("/login");
  };

  if (!email) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-950 dark:text-slate-100 sticky top-3 z-50 mx-auto w-[95%] max-w-7xl">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/75 px-5 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-md transition-all duration-200 dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-none">
        
        {/* Brand / Logo + Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-black text-sm shadow-md shadow-teal-500/20">
              T
            </div>
            <span className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Taskify
            </span>
          </Link>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                isActive("/")
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              }`}
            >
              Home
            </Link>
          
          </nav>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setToggle(!toggle)}
            aria-label="User profile menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-linear-to-tr from-teal-600 to-emerald-500 text-sm font-bold text-white shadow-md shadow-teal-500/20 ring-2 ring-white transition hover:scale-105 dark:ring-slate-800"
          >
            {icon}
          </button>

          {toggle && (
            <div className="absolute right-0 top-12 z-50 flex w-56 flex-col gap-1 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Signed in as
                </p>
                <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;