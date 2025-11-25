"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";
export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);

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

  useEffect(() => {
    // Connect to socket server to receive live updates
    try {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        console.log("Admin socket connected", socketRef.current?.id);
      });

      socketRef.current.on("new-patient", (data: any) => {
        if (!data) return;
        // avoid dupes by id
        setPatients((prev) => {
          if (!data.id) {
            // if no id, just prepend
            const updated = [data, ...prev];
            try {
              const raw = localStorage.getItem("patients");
              const arr = raw ? JSON.parse(raw) : [];
              arr.push(data);
              localStorage.setItem("patients", JSON.stringify(arr));
            } catch {}
            return updated;
          }
          const exists = prev.find((p) => p.id === data.id);
          if (exists) return prev;
          const updated = [data, ...prev];
          // also persist to localStorage so admin and form stay in sync
          try {
            const raw = localStorage.getItem("patients");
            const arr = raw ? JSON.parse(raw) : [];
            arr.push(data);
            localStorage.setItem("patients", JSON.stringify(arr));
          } catch (err) {
            console.warn("Failed to persist new patient from socket:", err);
          }
          return updated;
        });
      });

      socketRef.current.on("form-active", (payload: any) => {
        if (!payload || !payload.sessionId) return;
        setSessions((prev) => {
          const found = prev.find((s) => s.sessionId === payload.sessionId);
          const now = Date.now();
          if (found) {
            return prev.map((s) => (s.sessionId === payload.sessionId ? { ...s, partial: payload.partial, lastActive: now, status: "active" } : s));
          }
          return [{ sessionId: payload.sessionId, partial: payload.partial, lastActive: now, status: "active" }, ...prev];
        });
      });

      socketRef.current.on("form-inactive", (payload: any) => {
        if (!payload || !payload.sessionId) return;
        setSessions((prev) => prev.map((s) => (s.sessionId === payload.sessionId ? { ...s, status: "inactive", lastActive: payload.timestamp || Date.now() } : s)));
      });

      socketRef.current.on("form-left", (payload: any) => {
        if (!payload || !payload.sessionId) return;
        setSessions((prev) => prev.filter((s) => s.sessionId !== payload.sessionId));
      });

      socketRef.current.on("connect_error", (err: any) => {
        console.warn("Admin socket connect_error", err);
      });
    } catch (err) {
      console.warn("Failed to connect admin socket:", err);
      socketRef.current = null;
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  // cleanup old sessions periodically (mark inactive after 30s)
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setSessions((prev) => prev.map((s) => {
        if (s.status === 'active' && now - (s.lastActive || 0) > 30000) return { ...s, status: 'inactive' };
        return s;
      }));
    }, 5000);
    return () => clearInterval(iv);
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

        {sessions.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-slate-700 mb-2">Active Forms</div>
            <div className="flex gap-2 flex-wrap">
              {sessions.map((s) => {
                const age = Date.now() - (s.lastActive || 0);
                const isActive = s.status === 'active' && age <= 30000;
                const color = isActive ? 'bg-emerald-400' : (s.status === 'inactive' ? 'bg-amber-400' : 'bg-slate-300');
                const name = (s.partial && (s.partial.firstName || s.partial.lastName)) ? `${s.partial.firstName || ''} ${s.partial.lastName || ''}`.trim() : 'Filling...';
                return (
                  <div key={s.sessionId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border">
                    <span className={`inline-block w-2 h-2 rounded-full ${color}`} aria-hidden />
                    <div className="text-sm text-slate-700">{name}</div>
                    <div className="text-xs text-slate-400">{isActive ? 'active' : s.status}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Search by Name</label>
          <div className="relative w-full md:w-1/2">
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
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPatient(p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSelectedPatient(p);
                }}
                className="w-full text-left border rounded-lg p-4 bg-slate-50 hover:shadow-md transition cursor-pointer"
              >
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
              </button>
            ))
          )}
        </div>
      </div>
      
      {selectedPatient && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-800">Patient Details</h2>
              <button
                onClick={() => setSelectedPatient(null)}
                aria-label="Close details"
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
              <div><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.middleName} {selectedPatient.lastName}</div>
              <div><strong>Date of Birth:</strong> {selectedPatient.dob || '-'}</div>
              <div><strong>Gender:</strong> {selectedPatient.gender || '-'}</div>
              <div><strong>Phone:</strong> {selectedPatient.phone || '-'}</div>
              <div className="md:col-span-2"><strong>Email:</strong> {selectedPatient.email || '-'}</div>
              <div className="md:col-span-2"><strong>Address:</strong> {selectedPatient.address || '-'}</div>
              <div><strong>Language:</strong> {selectedPatient.language || '-'}</div>
              <div><strong>Nationality:</strong> {selectedPatient.nationality || '-'}</div>
              <div><strong>Religion:</strong> {selectedPatient.religion || '-'}</div>
              <div className="md:col-span-2"><strong>Emergency Contact:</strong> {selectedPatient.emergencyName || '-'} {selectedPatient.emergencyPhone ? `(${selectedPatient.emergencyPhone})` : ''}</div>
              <div className="md:col-span-2"><strong>Relationship:</strong> {selectedPatient.emergencyRelation || '-'}</div>
              <div className="md:col-span-2 text-xs text-slate-500 pt-2">Submitted: {new Date(selectedPatient.createdAt).toLocaleString()}</div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
