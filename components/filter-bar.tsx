"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SECTION_AGE, SECTION_DATASET } from "@/lib/datasets";
import type { MetaResponse } from "@/lib/types";

function Select({
  label,
  name,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (name: string, value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex min-w-36 flex-col gap-1 text-xs font-medium text-slate">
      {label}
      <select
        className="rounded-sm border border-outline bg-surface-lowest px-3 py-1.5 text-sm text-charcoal disabled:opacity-50"
        value={value}
        disabled={disabled || options.length === 0}
        onChange={(event) => onChange(name, event.target.value)}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({ dataset: datasetOverride }: { dataset?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const dataset = datasetOverride ?? SECTION_DATASET[pathname] ?? "perceived_mh_annual";
  const showAge = SECTION_AGE[pathname] ?? false;
  const hide = pathname.endsWith("/about");
  const [meta, setMeta] = useState<MetaResponse | null>(null);

  useEffect(() => {
    fetch(`/api/meta?dataset=${encodeURIComponent(dataset)}`)
      .then((response) => response.json())
      .then(setMeta)
      .catch(() => setMeta(null));
  }, [dataset]);

  const current = useMemo(
    () => ({
      year: params.get("year") ?? "",
      geo: params.get("geo") ?? "",
      sex: params.get("sex") ?? "",
      indicator: params.get("indicator") ?? "",
      age: params.get("age") ?? "",
    }),
    [params],
  );

  function update(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(name);
    else next.set(name, value);
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const ageSupported = Boolean(meta?.ageSupported && showAge);

  if (hide) return null;

  return (
    <div className="mb-8 flex flex-col gap-3 border border-outline bg-surface-dim p-3">
      <div className="flex flex-wrap items-end gap-3">
        <Select label="Year / cycle" name="year" value={current.year} options={meta?.years ?? []} onChange={update} />
        <Select label="Province" name="geo" value={current.geo} options={meta?.geos ?? []} onChange={update} />
        <Select label="Sex" name="sex" value={current.sex} options={meta?.sexes ?? []} onChange={update} />
        <Select
          label="Indicator"
          name="indicator"
          value={current.indicator}
          options={meta?.indicators ?? []}
          onChange={update}
        />
        {ageSupported ? (
          <Select label="Age group" name="age" value={current.age} options={meta?.ageGroups ?? []} onChange={update} />
        ) : null}
      </div>
      {!meta?.available ? (
        <p className="text-xs text-slate">
          Filters populate after CSV files are added to <code>data/processed/</code>.
          {meta?.missing?.length ? ` Missing: ${meta.missing.join(", ")}` : ""}
        </p>
      ) : !ageSupported && showAge ? (
        <p className="text-xs text-slate">
          Age is hidden for this table. The uploaded file has no usable age break.
        </p>
      ) : null}
    </div>
  );
}
