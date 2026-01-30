"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider"; // Keep your AuthContext

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login"); // Next.js way to navigate
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center sticky top-0 z-50">
      <div className="font-bold text-xl">
        <Link href="/">🎬 Movie Review</Link>
      </div>

      <div className="flex gap-4 items-center">
        {/* Only show 'Movies' link to guests or regular users */}
        {(!user || user.role !== "admin") && (
          <Link href="/movies" className="hover:underline">Movies</Link>
        )}

        {!token ? (
          <Link href="/register" className="hover:underline">Register</Link>
        ) : (
          <>
            <span className="text-sm">
              Hello, <b>{user?.name}</b>{" "}
              <span className="text-xs opacity-75">({user?.role})</span>
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded text-sm font-bold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
