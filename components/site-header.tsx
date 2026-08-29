"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explorer", label: "Data Explorer" },
  { href: "/insights", label: "Insights" },
  { href: "/workflow", label: "Data Workflow" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline bg-surface-lowest px-4 md:px-10">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-semibold text-primary">
          MindMetrics
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium ${
                isActive(pathname, link.href)
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-variant hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <button
        type="button"
        className="rounded-sm border border-outline px-3 py-1.5 text-sm text-on-variant md:hidden"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        Menu
      </button>
      {open ? (
        <nav className="absolute top-16 left-0 flex w-full flex-col border-b border-outline bg-surface-lowest px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`px-2 py-2 text-sm ${
                isActive(pathname, link.href) ? "text-primary" : "text-on-variant"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
