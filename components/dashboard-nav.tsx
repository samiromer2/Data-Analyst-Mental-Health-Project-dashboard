"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const sections = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/trends", label: "Trends" },
  { href: "/dashboard/demographics", label: "Demographics" },
  { href: "/dashboard/geographic", label: "Geographic" },
  { href: "/dashboard/risk", label: "Risk Indicators" },
  { href: "/dashboard/about", label: "About the Data" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function DashboardNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-outline bg-surface-dim px-4 py-8 lg:flex">
        <p className="px-2 text-lg font-semibold text-primary">Dashboard</p>
        <p className="mb-6 px-2 text-sm text-slate">What is happening</p>
        <nav className="flex flex-col gap-1">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={query ? `${section.href}?${query}` : section.href}
              className={`rounded-sm px-3 py-2 text-sm ${
                isActive(pathname, section.href)
                  ? "bg-surface-lowest font-semibold text-primary"
                  : "text-on-variant hover:bg-surface-container"
              }`}
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </aside>
      <nav className="flex gap-2 overflow-x-auto border-b border-outline bg-surface-dim px-4 py-3 lg:hidden">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={query ? `${section.href}?${query}` : section.href}
            className={`whitespace-nowrap rounded-sm border px-3 py-1.5 text-sm ${
              isActive(pathname, section.href)
                ? "border-primary text-primary"
                : "border-outline text-on-variant"
            }`}
          >
            {section.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
