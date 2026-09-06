"use client";

import { useMemo, useState } from "react";

type VectorMeta = {
  vector: string;
  geo: string;
  sex: string;
  age_group: string;
  indicator: string;
  last_known_year: number;
  last_known_value: number | null;
};

type PredictResult = {
  vector: string;
  geo: string;
  sex: string;
  age_group: string;
  indicator: string;
  live_year: number;
  live_value: number;
  release_time: string | null;
  compared_to_cleaned_snapshot: { year: number; value: number | null };
  prediction: "Up" | "Down";
  probabilities: Record<string, number>;
};

export function LivePredictor({ vectors }: { vectors: VectorMeta[] }) {
  const [selected, setSelected] = useState(vectors[0]?.vector ?? "");
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const indicators = useMemo(
    () => vectors.filter((v) => v.vector === selected),
    [vectors, selected],
  );
  const current = indicators[0];

  async function runLive() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/live-predict?vector=${selected}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error reaching the live feed.");
    } finally {
      setLoading(false);
    }
  }

  if (!vectors.length) {
    return (
      <div className="flex min-h-48 flex-col justify-center border border-dashed border-outline bg-surface-dim px-6 py-8">
        <h3 className="text-base font-semibold text-charcoal">Live model service not reachable</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate">
          Start it from the analysis repo: <code>.venv/bin/uvicorn api_service.main:app --port 8000</code>,
          then reload this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm text-on-variant">
          Series (province / sex / indicator)
          <select
            className="border border-outline bg-surface-lowest px-3 py-2 text-sm text-charcoal"
            value={selected}
            onChange={(event) => {
              setSelected(event.target.value);
              setResult(null);
              setError(null);
            }}
          >
            {vectors.map((v) => (
              <option key={v.vector} value={v.vector}>
                {v.geo} · {v.sex} · {v.indicator}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={runLive}
          disabled={loading}
          className="border border-primary bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50"
        >
          {loading ? "Fetching from StatCan..." : "Get live value + prediction"}
        </button>
      </div>

      {current && (
        <p className="text-sm text-slate">
          Last cleaned snapshot: {current.last_known_year} · {current.last_known_value}%
        </p>
      )}

      {error && (
        <p className="border border-outline bg-surface-dim px-4 py-3 text-sm text-charcoal">
          {error}
        </p>
      )}

      {result && (
        <div className="grid gap-4 border border-outline bg-surface-lowest p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate">Live from StatCan WDS</p>
            <p className="mt-1 text-3xl font-bold text-charcoal">{result.live_value}%</p>
            <p className="text-sm text-on-variant">{result.live_year} cycle</p>
            <p className="mt-2 text-xs text-slate">
              vs. cleaned snapshot: {result.compared_to_cleaned_snapshot.year} ·{" "}
              {result.compared_to_cleaned_snapshot.value}%
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate">Predicted next cycle</p>
            <p
              className={`mt-1 text-3xl font-bold ${
                result.prediction === "Up" ? "text-charcoal" : "text-charcoal"
              }`}
            >
              {result.prediction}
            </p>
            <p className="text-sm text-on-variant">
              P(Up) {(result.probabilities.Up * 100).toFixed(1)}% · P(Down){" "}
              {(result.probabilities.Down * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
