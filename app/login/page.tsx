"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // mock credential ง่าย ๆ
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "admin123";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (username === ADMIN_USER && password === ADMIN_PASS) {
     
      if (typeof window !== "undefined") {
        localStorage.setItem("isAdmin", "true");
      }
      router.push("/admin");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <main className="min-h-screen bg-sky-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-sky-700 mb-2">
          Admin Login
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          For authorized hospital staff only.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-right">
          <a
            href="/"
            className="text-xs text-sky-600 hover:text-sky-800"
          >
            Back to patient form
          </a>
        </div>
      </div>
    </main>
  );
}
