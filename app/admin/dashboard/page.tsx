"use client";

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../services/api"; 
import { isAxiosError } from "axios"; // Added for proper error typing

interface DashboardStats {
  counts: {
    users: number;
    movies: number;
    reviews: number;
  };
  recentUsers: Array<{
    id: number;
    name: string;
    createdAt: string;
    role?: { name: string };
  }>;
  movies: Array<{
    id: number;
    title: string;
    avgRating: number;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get<DashboardStats>("/admin/stats");
        setStats(res.data);
        setError(null);
      } catch (err: unknown) { // Use unknown instead of any
        console.error("Error fetching stats:", err);
        
        // Proper Type Guarding for Axios Errors
        if (isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to fetch dashboard data");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
        <p className="font-bold underline mb-2">Access Denied or Server Error</p>
        <p className="text-sm">{error || "Data unavailable"}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 text-xs bg-red-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-red-600 transition-all active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-gray-500 font-medium text-sm">Real-time platform statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Movies" value={stats.counts.movies} icon="🎬" />
        <StatCard label="Total Users" value={stats.counts.users} icon="👤" />
        <StatCard 
          label="Avg App Rating" 
          value={stats.movies.length > 0 
            ? (stats.movies.reduce((acc, m) => acc + (Number(m.avgRating) || 0), 0) / stats.movies.length).toFixed(1) 
            : "0.0"
          } 
          icon="⭐" 
        />
        <StatCard label="Total Reviews" value={stats.counts.reviews} icon="👁️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 mb-8 uppercase tracking-[0.2em]">Movie Rating Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.movies}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="title" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  tick={{ fill: '#9ca3af', fontWeight: 'bold' }}
                />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="avgRating" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 mb-8 uppercase tracking-[0.2em]">Newest Members</h3>
          <div className="space-y-6">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-800">{user.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {user.role?.name || 'User'} • {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {stats.recentUsers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs font-bold text-gray-300 italic">No recent registrations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Fixed StatCard with explicit props typing
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="text-4xl filter drop-shadow-sm">{icon}</div>
      <div>
        <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.15em] mt-1">{label}</p>
      </div>
    </div>
  );
}