import type { TrendSignalResult } from "@/lib/trend";
import { DataNotice } from "./data-notice";
import { EmptyState } from "./empty-state";

const WIDE_CI_THRESHOLD_PP = 5;

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

function directionGlyph(direction: "Up" | "Down") {
  return direction === "Up" ? "↑" : "↓";
}

function sexLabel(sex: string) {
  if (sex === "Both") return "Both sexes";
  return sex;
}

export function TrendSignalCard({
  result,
  title = "Trend signal",
}: {
  result: TrendSignalResult;
  title?: string;
}) {
  if (result.status === "insufficient") {
    return (
      <EmptyState
        title="Insufficient historical data for model-based trend analysis"
        body="This combination of filters does not have enough observed survey cycles for the Trend Direction Model to produce a signal."
      />
    );
  }

  const row = result.row;
  const probability = row.modelSignal === "Up" ? row.modelProbabilityUp : row.modelProbabilityDown;
  const wideCi = row.ciWidthT != null && row.ciWidthT >= WIDE_CI_THRESHOLD_PP;

  return (
    <div className="flex flex-col gap-4 border border-outline bg-surface-lowest p-6">
      <div>
        <p className="text-sm font-medium text-slate">{title}</p>
        <p className="mt-1 text-xs leading-5 text-on-variant">
          {row.indicator} · {row.geo} · {sexLabel(row.sex)}
          {row.ageGroup ? ` · ${row.ageGroup}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate">Current value</p>
          <p className="font-data mt-1 text-2xl font-semibold text-charcoal">
            {formatPct(row.valueT)}
          </p>
          <p className="mt-1 text-xs text-slate">{row.yearT}</p>
        </div>
        <div>
          <p className="text-xs text-slate">Model trend</p>
          <p className="font-data mt-1 flex items-baseline gap-1 text-2xl font-semibold text-primary">
            <span aria-hidden="true">{directionGlyph(row.modelSignal)}</span>
            {row.modelSignal}
          </p>
          <p className="mt-1 text-xs text-slate">estimated, next cycle</p>
        </div>
        <div>
          <p className="text-xs text-slate">Model probability</p>
          <p className="font-data mt-1 text-2xl font-semibold text-charcoal">
            {(probability * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-xs text-slate">for &ldquo;{row.modelSignal}&rdquo;</p>
        </div>
        <div>
          <p className="text-xs text-slate">Confidence interval</p>
          <p className="font-data mt-1 text-2xl font-semibold text-charcoal">
            {row.ciWidthT != null ? `±${(row.ciWidthT / 2).toFixed(1)}pp` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate">on the current value</p>
        </div>
      </div>

      <DataNotice>
        No future survey cycle is available for this series yet. This is the model&apos;s
        estimated direction for the next cycle, not an observed value.
      </DataNotice>

      {wideCi ? (
        <DataNotice>
          {`Interpret with caution: this estimate has a wide margin of error (±${(row.ciWidthT! / 2).toFixed(1)}pp). A small predicted move may not represent a meaningful change.`}
        </DataNotice>
      ) : null}

      {row.qualityFlagT === "E" ? (
        <DataNotice>
          Data quality: this observation is flagged &ldquo;use with caution&rdquo; by the source
          agency.
        </DataNotice>
      ) : null}
    </div>
  );
}
