"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  /**
   * INTERCEPT LOGIC:
   * 1. Check if the 'token' exists.
   * 2. If no token, prevent the Link from going to /movies.
   * 3. Redirect the user to /login instead.
   */
  const handleMoviesNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!token) {
      e.preventDefault(); 
      router.push("/login");
    }
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
      <div className="font-bold text-xl">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          🎬 Movie Review
        </Link>
      </div>

      <div className="flex gap-6 items-center">
        {/* 'Movies' link with custom navigation guard */}
        {(!user || user.role !== "admin") && (
          <Link 
            href="/movies" 
            onClick={handleMoviesNavigation}
            className="font-medium hover:text-blue-200 transition-colors"
          >
            Movies
          </Link>
        )}

        {!token ? (
          <div className="flex gap-4">
           
            <Link href="/register" className="hover:text-blue-200 font-medium">
              Register
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <span className="text-sm border-r border-blue-400 pr-4">
              Hello, <b className="capitalize">{user?.name}</b>{" "}
              <span className="text-[10px] bg-blue-800 px-1.5 py-0.5 rounded ml-1 uppercase">
                {user?.role}
              </span>
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600 transition-all shadow-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}