"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import api from "../services/api"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { AxiosError } from "axios";

// Interface to handle the backend error response safely
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    confirmPassword: "" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (error) setError(""); // Clear error when user types
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      // Destructure to send only what the backend needs
      const { name, email, password } = form;
      
      // Attempt registration
      await api.post("/auth/register", { name, email, password });
      
      router.push("/login?registered=true");
    } catch (err) {
      // Fixed the 'any' issue using AxiosError casting
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const serverMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
      
      setError(serverMessage || "Registration failed. Check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 md:p-10 border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-green-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Join CineAdmin</h1>
          <p className="text-gray-500 mt-2">Create an account to start reviewing</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              required
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
            />
          </div>

          {/* Email Address */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
            />
          </div>

          {/* Create Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              required
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              required
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="bg-green-600 text-white py-4 rounded-2xl w-full font-bold shadow-lg shadow-green-100 hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-green-600 font-bold hover:underline underline-offset-4">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}