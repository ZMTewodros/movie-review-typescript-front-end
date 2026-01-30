"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", form);
      const { token, user } = res.data;

      login(token); 

      // Use the 'user' object from the API response immediately
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/movies");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="p-10 bg-white shadow-2xl rounded-3xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-black mb-6 text-center text-gray-900">Sign In</h1>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({...form, email: e.target.value})} 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({...form, password: e.target.value})} 
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm font-bold mt-4 text-center">{error}</p>}
        <button 
          disabled={loading}
          className="bg-blue-600 text-white w-full py-4 rounded-2xl mt-6 font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  );
}