import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "UMKMMall — Mini Dashboard",
  description: "Dashboard internal untuk memantau aktivitas & fitur UMKMMall",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-50 min-h-screen">
        <Navbar />
        <main className="px-4 pb-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
