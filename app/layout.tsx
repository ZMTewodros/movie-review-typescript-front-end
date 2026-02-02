"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "./components/AuthProvider";
import Navbar from "./components/Navbar";
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Detect if we are in the admin section
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          {/* Only show the main Navbar if NOT on an admin page */}
          {!isAdminPage && <Navbar />}
          
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}