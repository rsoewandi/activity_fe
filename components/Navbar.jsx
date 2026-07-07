"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/activities", label: "Kelola Activity" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 border-b border-gray-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent"
        >
          UMKMMall Admin
        </Link>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-indigo-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
