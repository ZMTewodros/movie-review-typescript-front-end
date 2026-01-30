"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Film,
} from "lucide-react";

// You should get user info via context, cookies, or a fetch to your API.
// We'll hardcode a dummy admin user for this example.
const SUPER_ADMIN_EMAIL = "tewodrosayalew111@gmail.com";
const currentUser = {
  email: "tewodrosayalew111@gmail.com", // Replace with real user info in prod!
};

const isSuperAdmin = currentUser?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/admin/users", label: "Manage Users", icon: <Users size={20} /> },
  { href: "/admin/movies", label: "Manage Movies", icon: <Film size={20} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Replace this with a real logout (clear cookies, context, etc)
  const handleLogout = () => {
    // Example: router.push("/login");
    // If using cookies: document.cookie = 'token=; Max-Age=0; path=/;';
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 text-center border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-widest uppercase text-blue-400">
            {isSuperAdmin ? "Super Admin" : "CineAdmin"}
          </h1>
        </div>
        <nav className="flex-1 mt-6">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                    pathname === link.href
                      ? "bg-blue-600 text-white shadow-lg border-l-4 border-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {link.icon}
                  <span className="text-sm font-medium uppercase tracking-wider">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button
            className="w-full flex items-center gap-3 justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded transition text-sm font-bold"
            onClick={handleLogout}
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Optional header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 shadow-sm">
          <div></div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}