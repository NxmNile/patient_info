"use client";

import { useState, ChangeEvent, FormEvent } from "react";

export default function PatientFormPage() {
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
    religion: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("Data submitted successfully!");
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
      religion: "",
    });
  };

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-10 flex flex-col items-center relative">
      <a
        href="/login"
        className="absolute top-5 right-5 px-4 py-2 bg-white text-sky-600 rounded-lg shadow hover:bg-sky-100 transition"
      >
        Admin Login
      </a>

      {/* Form Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 md:p-8 mt-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-sky-700">
            Patient Information Form
          </h1>
          <p className="text-slate-500 mt-1">
            Please fill in the patient information below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name section */}
          <div className="grid md:grid-cols-3 gap-4">
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
          <div className="grid md:grid-cols-2 gap-4">
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
          <div className="grid md:grid-cols-2 gap-4">
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
          <div className="grid md:grid-cols-2 gap-4">
            <SelectBlock
              label="Preferred Language"
              required
              name="language"
              value={form.language}
              onChange={handleChange}
              options={["English", "Thai"]}
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
          <div className="grid md:grid-cols-2 gap-4">
            <InputBlock
              label="Emergency Contact Name (optional)"
              name="emergencyName"
              value={form.emergencyName}
              onChange={handleChange}
            />
            <SelectBlock
              label="Emergency Relationship (optional)"
              name="emergencyRelation"
              value={form.emergencyRelation}
              onChange={handleChange}
              options={["Parent", "Spouse", "Sibling", "Child", "Friend", "Other"]}
            />
          </div>

          {/* Religion */}
          <InputBlock
            label="Religion (optional)"
            name="religion"
            value={form.religion}
            onChange={handleChange}
          />

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm"
            >
              Submit
            </button>
          </div>
        </form>
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
      <label className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
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
  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        <option value="">Select...</option>
        {options.map((opt: string) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
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
        className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
      />
    </div>
  );
}
