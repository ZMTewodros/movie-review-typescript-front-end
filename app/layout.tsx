import { AuthProvider } from "./components/AuthProvider";
import Navbar from "./components/Navbar"; // Assuming you have a Navbar



export const metadata = {
  title: "CineAdmin | Movie Reviews",
  description: "Manage and review your favorite movies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}