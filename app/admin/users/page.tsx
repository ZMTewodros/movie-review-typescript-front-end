"use client";

import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Trash2, ShieldCheck, ArrowDownToLine } from "lucide-react";
import { AxiosError } from "axios";

const SUPER_ADMIN_EMAIL = "tewodrosayalew111@gmail.com";

interface Role {
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role?: Role;
}

interface ApiErrorResponse {
  message?: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");

      if (stored && stored !== "undefined") {
        const parsed = JSON.parse(stored);

        const email: string = parsed?.email?.toLowerCase().trim();
        const role: string = parsed?.role?.toLowerCase();

        setIsSuperAdmin(email === SUPER_ADMIN_EMAIL.toLowerCase());
        setIsAdmin(role === "admin");
      }
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
    }
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await api.get<User[]>("/users");

      setUsers(res.data);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;

      alert(
        err.response?.data?.message ||
          "Error loading users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const promote = async (id: number): Promise<void> => {
    if (!isSuperAdmin) {
      alert("Only super admin can promote users");
      return;
    }

    if (!window.confirm("Promote this user to admin?")) return;

    try {
      await api.put(`/users/promote/${id}`);
      // alert("User promoted successfully");
      fetchUsers();
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      alert(err.response?.data?.message || "Failed to promote user");
    }
  };

  const demote = async (id: number): Promise<void> => {
    if (!isSuperAdmin) {
      alert("Only super admin can demote users");
      return;
    }

    if (!window.confirm("Demote this admin to normal user?")) return;

    try {
      await api.put(`/users/demote/${id}`);
      // alert("User demoted successfully");
      fetchUsers();
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      alert(err.response?.data?.message || "Failed to demote user");
    }
  };

  const remove = async (id: number, email: string): Promise<void> => {
    // BOTH admin and super admin can delete
    if (!isAdmin && !isSuperAdmin) {
      alert("Only admins can delete users");
      return;
    }

    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      alert("Cannot delete super admin");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      // alert("User deleted successfully");
      fetchUsers();
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading users...
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Role</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u: User) => {
            const role = u.role?.name?.toLowerCase() || "user";

            const isTargetSuper =
              u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

            return (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.email}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      isTargetSuper
                        ? "bg-purple-100 text-purple-700"
                        : role === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {isTargetSuper ? "SUPER ADMIN" : role.toUpperCase()}
                  </span>
                </td>

                <td className="p-4 flex gap-3 justify-center">
                  {/* ONLY SUPER ADMIN CAN PROMOTE */}
                  {isSuperAdmin && role === "user" && (
                    <button
                      onClick={() => promote(u.id)}
                      className="text-green-600 hover:scale-110 transition"
                      title="Promote to Admin"
                    >
                      <ShieldCheck />
                    </button>
                  )}

                  {/* ONLY SUPER ADMIN CAN DEMOTE */}
                  {isSuperAdmin && role === "admin" && !isTargetSuper && (
                    <button
                      onClick={() => demote(u.id)}
                      className="text-yellow-600 hover:scale-110 transition"
                      title="Demote to User"
                    >
                      <ArrowDownToLine />
                    </button>
                  )}

                  {/* ADMIN OR SUPER ADMIN CAN DELETE */}
                  {(isAdmin || isSuperAdmin) && !isTargetSuper && (
                    <button
                      onClick={() => remove(u.id, u.email)}
                      className="text-red-600 hover:scale-110 transition"
                      title="Delete User"
                    >
                      <Trash2 />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
