"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";

type Role = {
  name: string;
};

type User = {
  id: string | number;
  name: string;
  email: string;
  role?: Role;
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const SUPER_ADMIN_EMAIL = "tewodrosayalew111@gmail.com";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data);
    } catch {
      alert("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="text-sm text-gray-400 font-semibold uppercase tracking-tighter">Total Users: {users.length}</div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-gray-400">User</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-400">Email</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-400">Role</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50/50">
                <td className="p-4 font-bold text-gray-700">{u.name}</td>
                <td className="p-4 text-gray-500 text-sm">{u.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    u.email === SUPER_ADMIN_EMAIL ? 'bg-purple-100 text-purple-700' :
                    u.role?.name === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {u.email === SUPER_ADMIN_EMAIL ? "SUPER ADMIN" : u.role?.name}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-3">
                  {/* Logic for Promote/Demote buttons same as original */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}