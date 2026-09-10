"use client";

import React from "react";
import type { WorkflowStepDetail } from "@/lib/workflow-data";

interface WorkflowVisualProps {
  step: WorkflowStepDetail;
}

export function WorkflowVisual({ step }: WorkflowVisualProps) {
  switch (step.visualType) {
    case "ingestion":
      return <IngestionVisual />;
    case "cleaning":
      return <CleaningVisual />;
    case "eda":
      return <EdaVisual />;
    case "kpi":
      return <KpiVisual />;
    case "ml_sandbox":
      return <MlSandboxVisual />;
    case "trend_live":
      return <TrendLiveVisual />;
    case "bi_dashboard":
      return <BiDashboardVisual />;
    default:
      return null;
  }
}

function IngestionVisual() {
  const sources = [
    { name: "StatCan 13-10-0972", type: "CCHS Annual", rows: "182K+", status: "A/B/C" },
    { name: "StatCan 13-10-0465", type: "CCHS-MH Disorders", rows: "1.7M+", status: "A/B" },
    { name: "StatCan 13-10-0802", type: "Stress & Coping", rows: "466K+", status: "A/B/E" },
    { name: "CIHI Child & Youth", type: "ED & Inpatient", rows: "4.3K+", status: "Tidy Rows" },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/40 dark:bg-inverse-surface/40">
      <div className="flex items-center justify-between border-b border-border-outline-variant/50 pb-2 text-xs font-medium text-text-slate-muted">
        <span>Public Data Ingestion Matrix</span>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">Zero Imputation Protocol</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((s) => (
          <div
            key={s.name}
            className="flex flex-col rounded-md border border-border-outline-variant bg-surface-container-low/40 p-2.5 transition-colors dark:border-outline/30 dark:bg-inverse-surface"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-text-charcoal dark:text-inverse-on-surface">
              <span>{s.name}</span>
              <span className="font-mono text-[10px] text-primary">{s.rows}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-text-slate-muted">
              <span>{s.type}</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1 rounded border border-dashed border-amber-500/40 bg-amber-500/5 p-2 text-xs text-amber-700 dark:text-amber-300">
        <span className="font-semibold">Suppression Rule:</span> Data cells flagged as <code className="rounded bg-amber-200/50 px-1 py-0.5 font-mono text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">F</code> (too unreliable) or <code className="rounded bg-amber-200/50 px-1 py-0.5 font-mono text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">x</code> (confidential) are retained as null to prevent synthetic distortion.
      </div>
    </div>
  );
}

function CleaningVisual() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/40 dark:bg-inverse-surface/40">
      <div className="flex items-center justify-between border-b border-border-outline-variant/50 pb-2 text-xs font-medium text-text-slate-muted">
        <span>Pipeline Schema Normalization</span>
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">Tidy Long-Format</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-[45%] rounded border border-rose-300/40 bg-rose-500/5 p-2.5 dark:border-rose-800/40">
          <div className="font-semibold text-rose-700 dark:text-rose-300">Raw StatCan / CIHI Wide</div>
          <div className="mt-1.5 font-mono text-[11px] text-text-slate-muted space-y-0.5">
            <div>• REF_DATE (2015/2016)</div>
            <div>• SYMBOL, TERMINATED (empty)</div>
            <div>• Wide CIHI pivot charts</div>
            <div>• Mixed SCALAR_FACTORs</div>
          </div>
        </div>

        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm">
          →
        </div>

        <div className="w-full md:w-[45%] rounded border border-emerald-300/40 bg-emerald-500/5 p-2.5 dark:border-emerald-800/40">
          <div className="font-semibold text-emerald-700 dark:text-emerald-300">Normalized Tidy Schema</div>
          <div className="mt-1.5 font-mono text-[11px] text-text-slate-muted space-y-0.5">
            <div>• start_year, end_year</div>
            <div>• geo, sex, age_group</div>
            <div>• indicator, value (Float)</div>
            <div>• quality_flag preserved</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded bg-surface-container-high/50 px-3 py-1.5 text-xs text-text-charcoal dark:bg-inverse-surface dark:text-inverse-on-surface font-mono">
        <span>Generated CSV: data/processed/perceived_mh_annual.csv</span>
        <span className="text-primary font-bold">✓ PASS</span>
      </div>
    </div>
  );
}

function EdaVisual() {
  const bars = [
    { label: "Females (Fair/Poor MH)", val: 8.1, color: "bg-rose-500", highlight: "Higher vulnerability" },
    { label: "Males (Fair/Poor MH)", val: 6.8, color: "bg-indigo-500", highlight: "Lower reporting" },
    { label: "Youth 15-24 (Post-2020 Drop)", val: 12.4, color: "bg-amber-500", highlight: "Critical inflection" },
    { label: "National Average", val: 7.4, color: "bg-primary", highlight: "Baseline" },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/40 dark:bg-inverse-surface/40">
      <div className="flex items-center justify-between border-b border-border-outline-variant/50 pb-2 text-xs font-medium text-text-slate-muted">
        <span>Exploratory Demographic Disparities (Gender & Youth)</span>
        <span className="font-mono text-xs text-primary">CCHS Cycles</span>
      </div>

      <div className="space-y-2.5">
        {bars.map((b) => (
          <div key={b.label} className="text-xs">
            <div className="flex justify-between text-text-charcoal dark:text-inverse-on-surface mb-1">
              <span>{b.label}</span>
              <span className="font-mono font-semibold">{b.val}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-container-high dark:bg-inverse-surface overflow-hidden">
              <div
                className={`h-full rounded-full ${b.color} transition-all duration-500`}
                style={{ width: `${(b.val / 15) * 100}%` }}
              />
            </div>
            <div className="mt-0.5 text-[10px] text-text-slate-muted italic">{b.highlight}</div>
          </div>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between rounded bg-primary/5 px-2.5 py-1.5 text-xs text-primary font-medium">
        <span>Key Insight: Gender Paradox & Post-2020 Youth Mental Health Dip</span>
      </div>
    </div>
  );
}

function KpiVisual() {
  const kpis = [
    { title: "High Mental Wellness", value: "59.2%", note: "Excellent / Very Good", trend: "↓ -4.1% 5yr" },
    { title: "Fair or Poor MH", value: "7.4%", note: "Population Vulnerability", trend: "↑ +1.2% 5yr" },
    { title: "Daily Life Stress", value: "21.8%", note: "Quite / Extremely stressful", trend: "↑ +2.4%" },
    { title: "Youth Ideation", value: "14.2%", note: "Ages 15-24 (12-mo)", trend: "↑ High Priority" },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/40 dark:bg-inverse-surface/40">
      <div className="flex items-center justify-between border-b border-border-outline-variant/50 pb-2 text-xs font-medium text-text-slate-muted">
        <span>Core Population Health KPIs (SQL Benchmarks)</span>
        <span className="font-mono text-xs text-primary">04_kpi_summary.csv</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {kpis.map((k) => (
          <div
            key={k.title}
            className="flex flex-col rounded-md border border-border-outline-variant bg-surface-container-low/40 p-2.5 dark:border-outline/30 dark:bg-inverse-surface"
          >
            <span className="text-[11px] text-text-slate-muted">{k.title}</span>
            <span className="mt-0.5 text-lg font-bold text-text-charcoal dark:text-inverse-on-surface font-mono">
              {k.value}
            </span>
            <div className="mt-1 flex items-center justify-between text-[10px]">
              <span className="text-text-slate-muted truncate">{k.note}</span>
              <span className="font-semibold text-primary">{k.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-text-slate-muted font-mono bg-surface-container-high/40 p-1.5 rounded dark:bg-inverse-surface">
        <code>SELECT geo, indicator, AVG(value) FROM perceived_mh GROUP BY geo;</code>
      </div>
    </div>
  );
}

function MlSandboxVisual() {
  const features = [
    { name: "Work & Financial Stress Index", weight: 34 },
    { name: "Sleep Disturbance & Coping", weight: 28 },
    { name: "Social Support & Family Access", weight: 22 },
    { name: "Physical Health Baseline", weight: 16 },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/40 dark:bg-inverse-surface/40">
      <div className="flex items-center justify-between border-b border-border-outline-variant/50 pb-2 text-xs font-medium text-text-slate-muted">
        <span>Sandbox Model Feature Importance (ROC-AUC 0.84)</span>
        <span className="rounded bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
          Ethical Firewall Active
        </span>
      </div>

      <div className="space-y-2">
        {features.map((f) => (
          <div key={f.name} className="text-xs">
            <div className="flex justify-between text-text-charcoal dark:text-inverse-on-surface mb-0.5">
              <span>{f.name}</span>
              <span className="font-mono text-[11px]">{f.weight}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-container-high dark:bg-inverse-surface">
              <div className="h-full rounded-full bg-primary" style={{ width: `${f.weight * 2.5}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded border border-indigo-500/30 bg-indigo-500/5 p-2 text-xs text-indigo-700 dark:text-indigo-300">
        <span className="font-semibold">Ethical Principle:</span> Synthetic ML sandbox strictly explores factor sensitivity. Predictive scoring of individuals is explicitly disallowed.
      </div>
    </div>
  );
}

function TrendLiveVisual() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/40 dark:bg-inverse-surface/40">
      <div className="flex items-center justify-between border-b border-border-outline-variant/50 pb-2 text-xs font-medium text-text-slate-muted">
        <span>StatCan WDS Live Ingestion & ML Classifier</span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          API Live
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs font-mono">
        <div className="flex-1 rounded border border-border-outline-variant bg-surface-container-low p-2 text-center dark:border-outline/30 dark:bg-inverse-surface">
          <div className="text-[10px] text-text-slate-muted">StatCan WDS Vector</div>
          <div className="font-bold text-primary">v12345678</div>
          <div className="text-[10px] text-emerald-600">refPer: 2024</div>
        </div>

        <div className="text-primary font-bold">→</div>

        <div className="flex-1 rounded border border-border-outline-variant bg-surface-container-low p-2 text-center dark:border-outline/30 dark:bg-inverse-surface">
          <div className="text-[10px] text-text-slate-muted">FastAPI Engine</div>
          <div className="font-bold text-text-charcoal dark:text-inverse-on-surface">/live-predict</div>
          <div className="text-[10px] text-text-slate-muted">Latency &lt;80ms</div>
        </div>

        <div className="text-primary font-bold">→</div>

        <div className="flex-1 rounded border border-primary/40 bg-primary/10 p-2 text-center">
          <div className="text-[10px] text-text-slate-muted">Trend Output</div>
          <div className="font-bold text-primary">Stable (72%)</div>
          <div className="text-[10px] text-text-slate-muted">Prob. matrix</div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-surface-container-high/40 rounded px-2.5 py-1 text-[11px] font-mono text-text-slate-muted dark:bg-inverse-surface">
        <span>Model: 06_trend_direction_model.joblib</span>
        <span className="text-primary">scikit-learn pipeline</span>
      </div>
    </div>
  );
}

function BiDashboardVisual() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/40 dark:bg-inverse-surface/40">
      <div className="flex items-center justify-between border-b border-border-outline-variant/50 pb-2 text-xs font-medium text-text-slate-muted">
        <span>Decision Support Deliverables & Power BI Rebuild</span>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-primary text-[10px] font-mono">Next.js 16 Native</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded border border-border-outline-variant bg-surface-container-low p-2 dark:border-outline/30 dark:bg-inverse-surface">
          <div className="font-bold text-primary">/dashboard</div>
          <div className="text-[10px] text-text-slate-muted mt-0.5">Curated Analytics & Trends</div>
        </div>
        <div className="rounded border border-border-outline-variant bg-surface-container-low p-2 dark:border-outline/30 dark:bg-inverse-surface">
          <div className="font-bold text-primary">/report</div>
          <div className="text-[10px] text-text-slate-muted mt-0.5">Native Power BI 4-Page System</div>
        </div>
        <div className="rounded border border-border-outline-variant bg-surface-container-low p-2 dark:border-outline/30 dark:bg-inverse-surface">
          <div className="font-bold text-primary">/executive-brief</div>
          <div className="text-[10px] text-text-slate-muted mt-0.5">Interactive Presentation Deck</div>
        </div>
      </div>

      <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs text-emerald-800 dark:text-emerald-300">
        <span className="font-semibold">Canada Albers Choropleth:</span> Embedded SVG projection mapping provincial mental health gradients in real time with zero external mapping libraries.
      </div>
    </div>
  );
}
