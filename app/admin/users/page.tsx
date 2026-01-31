"use client";
import React, { useEffect, useState } from "react";
import { Trash2, UserPlus, Shield, User as UserIcon, Loader2 } from "lucide-react";

// 1. Define strict interfaces to replace 'any'
interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  createdAt: string;
  role?: Role; // Matches the { include: [Role] } from NestJS
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        if (!response.ok) throw new Error("Failed to fetch users from server.");
        
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        // Handle error without 'any'
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handler for deleting a user
  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update local state to remove the user without reloading the page
        setUsers((prev) => prev.filter((user) => user.id !== id));
      } else {
        alert("Failed to delete user.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="animate-pulse">Syncing with database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
        <p className="font-bold">Database Connection Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">User Management</h2>
          <p className="text-xs text-gray-400">Manage system access and roles</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {users.length} Active Records
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest border-b">
            <tr>
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Access Level</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u: User) => (
              <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <UserIcon size={14} />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm italic">{u.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[9px] font-black px-3 py-1 rounded-full flex items-center w-fit gap-1 shadow-sm ${
                      u.role?.name.toLowerCase() === "admin" || u.roleId === 1
                        ? "bg-purple-100 text-purple-600 border border-purple-200"
                        : "bg-blue-100 text-blue-600 border border-blue-200"
                    }`}
                  >
                    <Shield size={10} />
                    {u.role?.name.toUpperCase() || (u.roleId === 1 ? "ADMIN" : "USER")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3 text-gray-400">
                    <button 
                      title="Edit Permissions"
                      className="p-1.5 hover:bg-amber-50 hover:text-amber-500 rounded-md transition-all active:scale-90"
                    >
                      <UserPlus size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)}
                      title="Delete User"
                      className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-all active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="p-20 text-center text-gray-400 italic bg-gray-50/50">
          No users found in the database.
        </div>
      )}
    </div>
  );
}