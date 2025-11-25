"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";
export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Check client-side flag set by the login page
    if (typeof window === "undefined") return;
    const flag = localStorage.getItem("isAdmin");
    if (flag === "true") {
      setIsAdmin(true);
    } else {
      // Not logged in as admin — send to login
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("patients");
      const arr = raw ? JSON.parse(raw) : [];
      setPatients(arr.slice().reverse());
    } catch (err) {
      console.warn("Failed to load patients:", err);
      setPatients([]);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "patients") {
        try {
          const arr = e.newValue ? JSON.parse(e.newValue) : [];
          setPatients(arr.slice().reverse());
        } catch (err) {
          setPatients([]);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (isAdmin === null) return null;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAdmin");
    }
    router.push("/");
  };

  const q = search.trim().toLowerCase();
  const filtered = patients.filter((p) => {
    if (!q) return true;
    const full = `${p.firstName || ""} ${p.middleName || ""} ${p.lastName || ""}`
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    return full.includes(q);
  });

  return (
    <main className="min-h-screen bg-sky-50 px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-sky-700">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Search by Name</label>
          <div className="relative w-full md:full">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name..."
              className="w-full pr-10 rounded-lg border border-slate-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="button"
              aria-label="search"
              onClick={() => inputRef.current?.focus()}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <CiSearch className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No patients found.</p>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-800">
                      {p.firstName} {p.middleName} {p.lastName}
                    </div>
                    <div className="text-sm text-slate-600">DOB: {p.dob || "-"} • Phone: {p.phone || "-"}</div>
                    <div className="text-sm text-slate-600">Email: {p.email || "-"}</div>
                  </div>
                  <div className="text-sm text-slate-500 text-right">
                    <div>Submitted: {new Date(p.createdAt).toLocaleString()}</div>
                    <div>Nationality: {p.nationality || "-"}</div>
                    <div>Language: {p.language || "-"}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
