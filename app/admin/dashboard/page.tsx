"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";

type RecentUser = {
  id: string | number;
  name: string;
  Role?: { name?: string };
  createdAt?: string;
};

type ChartData = {
  name: string;
  rating: number;
};

type Stats = {
  movies: number;
  users: number;
  reviews: number;
  avgRating: number;
  recentUsers: RecentUser[];
  ratingDist: ChartData[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    movies: 0,
    users: 0,
    reviews: 0,
    avgRating: 0,
    recentUsers: [],
    ratingDist: []
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/admin/stats");
        const { counts, movies, recentUsers } = res.data;

        const totalAvg =
          movies.length > 0
            ? movies.reduce(
                (sum: number, m: { avgRating?: string | number }) =>
                  sum + (typeof m.avgRating === "number" ? m.avgRating : parseFloat(m.avgRating || "0")),
                0
              ) / movies.length
            : 0;

        const chartData: ChartData[] = movies.map((m: { title: string; avgRating?: string | number }) => ({
          name: m.title.substring(0, 10),
          rating: typeof m.avgRating === "number" ? m.avgRating : parseFloat(m.avgRating || "0")
        }));

        setStats({
          movies: counts.movies,
          users: counts.users,
          reviews: counts.reviews,
          avgRating: totalAvg,
          recentUsers: recentUsers as RecentUser[],
          ratingDist: chartData
        });
      } catch (err) {
        console.error("Dashboard fetch error", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Movie Management Dashboard</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Movies" value={stats.movies} icon="🎬" />
        <StatCard label="Total Users" value={stats.users} icon="👤" />
        <StatCard label="Avg Rating" value={stats.avgRating} icon="⭐" />
        <StatCard label="Total Reviews" value={stats.reviews} icon="👁️" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold mb-4 text-gray-700">Movie Rating Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ratingDist}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="rating" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full md:w-80 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold mb-4 text-gray-700">Recent Users</h3>
          <ul className="space-y-4">
            {stats.recentUsers.map((u: RecentUser) => (
              <li key={u.id} className="flex items-center gap-3">
                <span className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase border border-blue-100 text-sm">
                  {u.name?.[0]}
                </span>
                <div>
                  <div className="font-medium text-gray-800 text-sm">{u.name}</div>
                  <div className="text-[11px] text-gray-500 uppercase font-semibold">
                    {u.Role?.name} • {u.createdAt?.slice(0, 10)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  icon: string;
};

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <span className="text-3xl">{icon}</span>
      <div>
        <div className="font-bold text-xl text-gray-900">{value}</div>
        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}