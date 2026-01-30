"use client";

import React, { useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      router.push("/login");
    } catch (e) {
      setError(e.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-8 bg-white shadow-xl rounded-2xl">
      <h1 className="text-3xl font-black mb-8 text-center text-gray-900">Join CineAdmin</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input required name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border" />
        <input required name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border" />
        <input required name="password" type="password" placeholder="Create Password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border" />
        {error && <div className="text-red-600 text-sm font-bold text-center">{error}</div>}
        <button className="bg-green-600 text-white py-4 rounded-xl w-full font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition">Create Account</button>
      </form>
    </div>
  );
}