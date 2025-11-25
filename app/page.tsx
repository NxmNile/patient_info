"use client";

import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function PatientFormPage() {
  const socketRef = useRef<Socket | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const sessionIdRef = useRef<string>(Date.now().toString() + '-' + Math.random().toString(36).slice(2,8));
  const activityTimeoutRef = useRef<number | null>(null);
  const activityDebounceRef = useRef<number | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    language: "",
    nationality: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    religion: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    notifyActive();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // emit to socket server (if available)
    socketRef.current?.emit("new-patient", form);

    // Build patient record with timestamp and id
    const patient = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...form,
    };

    // Persist to localStorage for admin view (frontend-only fallback)
    try {
      const raw = localStorage.getItem("patients");
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(patient);
      localStorage.setItem("patients", JSON.stringify(arr));
    } catch (err) {
      console.warn("Failed to persist patient locally:", err);
    }

    setSubmitted(true);

    // show confirmation and reset form
    // (we could keep the form populated if desired)
    setForm({
      firstName: "",
      middleName: "",
      lastName: "",
      dob: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      language: "",
      nationality: "",
      emergencyName: "",
      emergencyRelation: "",
      emergencyPhone: "",
      religion: "",
    });
    // after a submit, mark this session as inactive (finished)
    try {
      socketRef.current?.emit("form-inactive", { sessionId: sessionIdRef.current, timestamp: Date.now() });
    } catch {}
  };

  useEffect(() => {
    // connect to socket.io on mount — explicit URL for a dedicated socket server
    try {
      // change this URL if your socket server runs elsewhere
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
      });
      socketRef.current.on("connect_error", (err) => {
        console.warn("socket connect_error:", err);
      });
    } catch (err) {
      console.warn("socket.io connection failed:", err);
      socketRef.current = null;
    }

    const onBeforeUnload = () => {
      try {
        socketRef.current?.emit("form-inactive", { sessionId: sessionIdRef.current, timestamp: Date.now() });
      } catch {}
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      socketRef.current?.disconnect();
    };
  }, []);

  // notify active (debounced) and set inactivity timer
  function notifyActive() {
    if (!socketRef.current) return;
    // debounce to avoid spamming
    if (activityDebounceRef.current) window.clearTimeout(activityDebounceRef.current);
    activityDebounceRef.current = window.setTimeout(() => {
      try {
        socketRef.current?.emit("form-active", {
          sessionId: sessionIdRef.current,
          partial: { firstName: form.firstName, middleName: form.middleName, lastName: form.lastName },
          timestamp: Date.now(),
        });
      } catch (err) {}
    }, 300);

    // reset inactivity timer
    if (activityTimeoutRef.current) window.clearTimeout(activityTimeoutRef.current);
    activityTimeoutRef.current = window.setTimeout(() => {
      try {
        socketRef.current?.emit("form-inactive", { sessionId: sessionIdRef.current, timestamp: Date.now() });
      } catch (err) {}
    }, 20000); // 20s inactivity -> inactive
  }

  return (
    <main className="min-h-screen bg-sky-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col items-center relative">
      <a
        href="/login"
        className="absolute top-5 right-5 px-4 py-2 bg-white text-sky-600 rounded-lg shadow hover:bg-sky-100 transition"
      >
        Admin Login
      </a>

      {/* Form Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mt-8 sm:mt-10 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-sky-700">
            Patient Information Form
          </h1>
          <p className="text-slate-500 mt-1">
            Please fill in the patient information below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-5">
          {/* Name section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <InputBlock
              label="First Name"
              required
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
            <InputBlock
              label="Middle Name (optional)"
              name="middleName"
              value={form.middleName}
              onChange={handleChange}
            />
            <InputBlock
              label="Last Name"
              required
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          {/* DOB + Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <InputBlock
              label="Date of Birth"
              type="date"
              required
              name="dob"
              value={form.dob}
              onChange={handleChange}
            />
            <SelectBlock
              label="Gender"
              required
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={["Male", "Female", "Other", "Prefer not to say"]}
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <InputBlock
              label="Phone Number"
              required
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            <InputBlock
              label="Email"
              type="email"
              required
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <TextareaBlock
            label="Address"
            required
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          {/* Language + Nationality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <SelectBlock
              label="Preferred Language"
              required
              name="language"
              value={form.language}
              onChange={handleChange}
              options={[
                { value: "en", label: "English", flag: "uk" },
                { value: "th", label: "Thai", flag: "th" },
              ]}
            />
            <InputBlock
              label="Nationality"
              required
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
            />
          </div>

          {/* Emergency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-3">
              <InputBlock
                label="Emergency Contact Name (optional)"
                name="emergencyName"
                value={form.emergencyName}
                onChange={handleChange}
              />
              <InputBlock
                label="Emergency Contact Phone (optional)"
                name="emergencyPhone"
                value={form.emergencyPhone}
                onChange={handleChange}
              />
            </div>
            <SelectBlock
              label="Emergency Relationship (optional)"
              name="emergencyRelation"
              value={form.emergencyRelation}
              onChange={handleChange}
              options={["Parent", "Spouse", "Sibling", "Child", "Friend", "Other"]}
            />
          </div>

          {/* Religion */}
          <SelectBlock
            label="Religion (optional)"
            name="religion"
            value={form.religion}
            onChange={handleChange}
            options={["Buddhism", "Christianity", "Islam", "Hinduism", "Sikhism", "Judaism", "None", "Other"]}
          />

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="w-full md:w-auto px-5 py-3 sm:py-2.5 rounded-lg bg-sky-600 text-white text-sm sm:text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm"
            >
              Submit
            </button>
          </div>
        </form>
        {/* Popup modal shown after submit */}
        {submitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm md:max-w-lg w-full mx-4 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-800 text-center">
                Data submitted
              </h2>
              <p className="text-sm text-slate-600 mt-2 text-center">
                Patient data has been submitted. Do you want to submit another?
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 text-center"
                >
                  Close
                </button>
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 rounded-lg bg-sky-600 text-sm text-white hover:bg-sky-700 text-center"
                >
                  Submit another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function InputBlock({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
}: any) {
  return (
      <div className="flex flex-col">
          <label className="text-sm sm:text-base font-bold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-3 sm:py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-sky-400 w-full"
          />
        </div>
  );
}

function SelectBlock({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}: any) {
  // Helper to render SVG flag by code
  const FlagIcon = ({ code }: { code: string }) => {
    // Use provided image files from /public (public/thailand.png, public/united-kingdom.png)
    const map: Record<string, string> = {
      th: "/thailand.png",
      uk: "/united-kingdom.png",
    };
    const src = map[code];
    if (!src) return null;
    return <img src={src} alt={`${code} flag`} className="w-5 h-5 object-cover rounded-sm" />;
  };

  // Normalize options: accept strings or objects { value, label, flag }
  const normalized = (options || []).map((opt: any) => {
    if (typeof opt === "string") return { value: opt, label: opt, flag: undefined };
    return { value: opt.value ?? opt.label, label: opt.label ?? opt.value, flag: opt.flag };
  });

  const selected = normalized.find((o: any) => o.value === value);

  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {selected?.flag && <FlagIcon code={selected.flag} />}
        </div>
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={(selected && selected.flag ? "pl-10 " : "pl-3 ") + "rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-sky-400 w-full"}
        >
          <option value="">Select...</option>
          {normalized.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TextareaBlock({
  label,
  name,
  value,
  onChange,
  required = false,
}: any) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={3}
        className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-sky-400 w-full"
      />
    </div>
  );
}
