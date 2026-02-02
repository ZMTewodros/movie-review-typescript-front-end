"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Film, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../components/AuthProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const [adminName, setAdminName] = useState<string>("Admin");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") {
        const parsed = JSON.parse(stored);
        const name: string = parsed?.name || "Admin";
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAdminName(name);
      }
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
    }
  }, []);

  const navItems = [
    { name: "DASHBOARD", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "MANAGE USERS", href: "/admin/users", icon: <Users size={18} /> },
    { name: "MANAGE MOVIES", href: "/admin/movies", icon: <Film size={18} /> },
  ];

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <ShieldCheck className="text-blue-400" size={24} />
          <h1 className="text-lg font-black tracking-tighter text-white uppercase">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-4 px-6 py-4 text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? "bg-blue-600 text-white border-l-4 border-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}>
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-4 px-6 py-4 text-xs font-bold text-red-500 hover:bg-red-500/10 w-full rounded-lg transition-all"
          >
            <LogOut size={18} />
            SIGN OUT
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-blue-600 flex items-center justify-between px-8 text-white shadow-lg z-10">
          <div className="font-black text-xl flex items-center gap-2 tracking-tight">
             <Film size={24} /> MOVIE REVIEW
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              Hello, <span className="font-black text-white">{adminName}</span>
              <span className="ml-2 bg-blue-700/60 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-blue-400/30">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#F8F9FC]">
          {children}
        </main>
      </div>
    </div>
  );
}
