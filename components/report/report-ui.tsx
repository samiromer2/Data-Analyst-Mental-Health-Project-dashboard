"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { REPORT_TABS } from "@/lib/report-constants";

export function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border border-outline bg-surface-lowest p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate">{label}</p>
      <p className="mt-2 text-3xl font-bold text-charcoal">{value}</p>
      {sub ? <p className="mt-1 text-xs text-on-variant">{sub}</p> : null}
    </div>
  );
}

export function ReportTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-outline pb-3">
      {REPORT_TABS.map((tab) => {
        const active =
          tab.href === "/dashboard/report"
            ? pathname === "/dashboard/report"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap rounded-sm border px-3 py-1.5 text-sm ${
              active
                ? "border-primary bg-primary text-on-primary"
                : "border-outline text-on-variant hover:bg-surface-container"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ChoiceSlicer({
  label,
  param,
  options,
  allLabel,
}: {
  label: string;
  param: string;
  options: string[];
  allLabel?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get(param) ?? "";

  function update(value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(param);
    else next.set(param, value);
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <label className="flex min-w-40 flex-col gap-1 text-xs font-medium text-slate">
      {label}
      <select
        className="rounded-sm border border-outline bg-surface-lowest px-3 py-1.5 text-sm text-charcoal"
        value={current}
        onChange={(event) => update(event.target.value)}
      >
        {allLabel ? <option value="">{allLabel}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
