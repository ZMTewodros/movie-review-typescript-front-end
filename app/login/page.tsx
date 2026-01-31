"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import api from "../services/api";
import { LogIn } from "lucide-react";

const SUPER_ADMIN_EMAIL = "tewodrosayalew111@gmail.com";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const { token, user } = res.data;
      login(token, user);

      // Role-based redirect logic
      if (
        user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL // super admin
        || user.role === "admin"
      ) {
        router.push("/admin/dashboard");
      } else {
        router.push("/movies");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
        <div className="text-blue-600 flex items-center gap-2 font-black text-2xl justify-center mb-6">
          <LogIn size={28}/>
          Login
        </div>
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          required
          placeholder="Password"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        {error && <div className="bg-red-100 border border-red-200 text-red-600 rounded p-2 text-xs">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}