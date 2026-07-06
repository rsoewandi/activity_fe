import "./globals.css";

export const metadata = {
  title: "UMKMMall — Mini Dashboard",
  description: "Dashboard internal untuk memantau aktivitas & fitur UMKMMall",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-50 min-h-screen">
        <main className="p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}
