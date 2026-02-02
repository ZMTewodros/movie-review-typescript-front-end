"use client";
import React, { useContext, createContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: number;
  email: string;
  role: "user" | "admin" | string;
  [k: string]: unknown;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean; // Added to help UI wait for localStorage
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Track if hydration is done

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedToken) setToken(storedToken);
        
        // SAFE PARSING: Check if it exists AND is not the string "undefined"
        if (storedUser && storedUser !== "undefined") {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse auth data from storage:", error);
        // If data is corrupted, clear it to prevent infinite loop/crash
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}