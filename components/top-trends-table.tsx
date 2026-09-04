import type { TopTrendRow } from "@/lib/trend";

function fmtPct(value: number | null) {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

function fmtDelta(value: number | null) {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}pp`;
}

export function TopTrendsTable({ rows }: { rows: TopTrendRow[] }) {
  if (!rows.length) {
    return null;
  }

  return (
    <div className="border border-outline bg-surface-lowest p-6">
      <h2 className="text-lg font-semibold text-charcoal">
        Top observed movements, latest completed cycle
      </h2>
      <p className="mt-1 text-xs leading-5 text-slate">
        Ranked by absolute percentage-point change between two real, observed survey cycles. These
        are historical, factual changes. &ldquo;Model signal&rdquo; is what the Trend Direction
        Model would have predicted from the earlier cycle alone, shown for comparison against what
        actually happened - not a forecast of the future.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-dim text-slate">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Indicator</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Geography</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Previous cycle</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Latest cycle</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Change</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Direction</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">CI width</th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">Model signal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const valueT1 = row.delta != null ? row.valueT + row.delta : null;
              const agrees = row.modelSignal === row.actualDirection;
              return (
                <tr key={`${row.source}-${row.geo}-${row.indicator}-${row.sex}-${row.ageGroup}-${index}`} className="border-t border-outline align-top">
                  <td className="max-w-72 px-3 py-2 text-on-variant">{row.indicator}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-on-variant">{row.geo}</td>
                  <td className="font-data whitespace-nowrap px-3 py-2 text-charcoal">
                    {fmtPct(row.valueT)} <span className="text-slate">({row.yearT})</span>
                  </td>
                  <td className="font-data whitespace-nowrap px-3 py-2 text-charcoal">
                    {fmtPct(valueT1)} <span className="text-slate">({row.yearT1})</span>
                  </td>
                  <td className="font-data whitespace-nowrap px-3 py-2 text-charcoal">
                    {fmtDelta(row.delta)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-charcoal">
                    {row.actualDirection === "Up" ? "↑ Up" : row.actualDirection === "Down" ? "↓ Down" : "→ Flat"}
                  </td>
                  <td className="font-data whitespace-nowrap px-3 py-2 text-charcoal">
                    {row.ciWidthT != null ? `${row.ciWidthT.toFixed(1)}pp` : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-charcoal">
                    {row.modelSignal === "Up" ? "↑ Up" : "↓ Down"}
                    <span className="ml-1 text-xs text-slate">{agrees ? "(matched)" : "(missed)"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
