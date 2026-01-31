// frontend/app/admin/layout.tsx
"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Film, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "DASHBOARD", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "MANAGE USERS", href: "/admin/users", icon: <Users size={18} /> },
    { name: "MANAGE MOVIES", href: "/admin/movies", icon: <Film size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black tracking-tighter text-blue-400">SUPER ADMIN</h1>
        </div>
        
        <nav className="flex-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-4 px-6 py-4 text-xs font-bold transition-all ${
                  isActive ? "bg-blue-600 text-white border-l-4 border-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}>
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-blue-600 flex items-center justify-between px-8 text-white shadow-md">
          <div className="font-bold text-lg flex items-center gap-2">
             <Film size={20} /> Movie Review
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Hello, <span className="font-bold">Tewodros</span> (admin)</span>
            <button className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded text-xs font-bold transition-colors">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}