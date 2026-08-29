import type { MetricCard as MetricCardType } from "@/lib/types";

function formatValue(card: MetricCardType) {
  if (card.value == null) return "—";
  const digits = card.unit === "pp" ? 1 : 1;
  const prefix = card.unit === "pp" && card.value > 0 ? "+" : "";
  return `${prefix}${card.value.toFixed(digits)}${card.unit === "%" ? "%" : ""}`;
}

export function MetricCard({ card }: { card: MetricCardType }) {
  return (
    <article className="flex flex-col border border-outline bg-surface-lowest p-4">
      <p className="text-sm text-slate">{card.label}</p>
      <p className="font-data mt-2 text-2xl font-semibold text-primary">
        {formatValue(card)}
        {card.unit === "pp" && card.value != null ? (
          <span className="ml-1 text-sm font-medium text-slate">pp</span>
        ) : null}
      </p>
      <p className="mt-2 text-xs text-slate">{card.period ?? "No cycle loaded"}</p>
      <p className="mt-1 text-xs leading-5 text-on-variant">{card.note}</p>
    </article>
  );
}
