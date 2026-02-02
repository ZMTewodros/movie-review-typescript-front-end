"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { useAuth } from "../components/AuthProvider";
import api from "../services/api";
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

// Super Admin Email Configuration
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
      
      // Save auth state
      login(token, user);

      // Role-based redirect logic
      if (
        user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL || // Specific Super Admin check
        user.role === "admin"
      ) {
        router.push("/admin/dashboard");
      } else {
        router.push("/movies");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 w-full max-w-md border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm transform transition-transform hover:scale-105 duration-300">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 font-medium">Please sign in to continue</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 ml-1 uppercase tracking-wide">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 ml-1 uppercase tracking-wide">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
               <span className="flex items-center gap-2">Logging in...</span> 
            ) : (
               <>Login <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        {/* Footer / Register Link */}
        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-gray-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 font-black hover:underline transition-all inline-flex items-center gap-1">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}