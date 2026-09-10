"use client";

import { useState } from "react";
import Link from "next/link";
import { WORKFLOW_STEPS, type WorkflowStepDetail } from "@/lib/workflow-data";
import { WorkflowVisual } from "@/components/workflow/workflow-visuals";

export default function WorkflowPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep: WorkflowStepDetail = WORKFLOW_STEPS[activeStepIndex];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 md:px-8 lg:px-10">
      {/* Header */}
      <header className="mb-8 border-b border-border-outline-variant/60 pb-6 dark:border-outline/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-charcoal dark:text-inverse-on-surface md:text-4xl">
              Data Analysis Workflow
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-slate-muted md:text-base">
              How raw Canadian health survey data was acquired, audited, cleaned, and transformed into actionable population intelligence and decision-support tools.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/report"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-outline-variant bg-surface-container-low px-3.5 py-2 text-xs font-semibold text-text-charcoal transition hover:border-primary hover:text-primary dark:border-outline/40 dark:bg-inverse-surface dark:text-inverse-on-surface"
            >
              <span>View Power BI Report</span>
              <span>→</span>
            </Link>
            <Link
              href="/executive-brief"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary shadow-sm transition hover:bg-primary-container"
            >
              <span>Insight</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Master-Detail Split Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Steps Timeline (5 Cols) */}
        <div className="flex flex-col space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between pb-1 text-xs font-medium text-text-slate-muted">
            <span>PIPELINE STEPS ({WORKFLOW_STEPS.length})</span>
            <span className="text-[11px] italic">Hover or click to inspect</span>
          </div>

          <ol className="relative space-y-3">
            {WORKFLOW_STEPS.map((step, index) => {
              const isActive = index === activeStepIndex;
              return (
                <li key={step.id} className="relative">
                  {/* Step Card Element */}
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label={`Step ${step.n}: ${step.title}`}
                    aria-pressed={isActive}
                    onMouseEnter={() => setActiveStepIndex(index)}
                    onFocus={() => setActiveStepIndex(index)}
                    onClick={() => setActiveStepIndex(index)}
                    className={`group relative z-10 flex cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-md dark:border-primary dark:bg-primary/10 translate-x-1"
                        : "border-border-outline-variant bg-surface-container-lowest hover:border-primary/60 hover:bg-surface-container-low/50 dark:border-outline/30 dark:bg-inverse-surface/30 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* Step Number Circle */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-primary text-white shadow"
                          : "border border-border-outline-variant bg-surface-container-low text-text-slate-muted group-hover:border-primary/60 group-hover:text-primary dark:border-outline/30 dark:bg-inverse-surface"
                      }`}
                    >
                      {step.n}
                    </div>

                    {/* Step Brief Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-slate-muted">
                          {step.phase.split(":")[0]}
                        </span>
                        {isActive && (
                          <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Inspecting
                          </span>
                        )}
                      </div>
                      <h2
                        className={`text-base font-semibold transition-colors ${
                          isActive
                            ? "text-primary dark:text-primary-fixed"
                            : "text-text-charcoal group-hover:text-primary dark:text-inverse-on-surface"
                        }`}
                      >
                        {step.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-slate-muted">
                        {step.shortDesc}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Right Column: Sticky Detailed Visual & Methodology Summary (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="sticky top-20 flex flex-col gap-5 rounded-2xl border border-border-outline-variant/80 bg-surface-container-lowest p-6 shadow-sm dark:border-outline/40 dark:bg-inverse-surface/40 transition-all">
            {/* Active Step Header & Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-outline-variant/60 pb-4 dark:border-outline/40">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-white shadow-sm">
                  {activeStep.n}
                </span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {activeStep.phase}
                  </span>
                  <h2 className="text-xl font-bold text-text-charcoal dark:text-inverse-on-surface">
                    {activeStep.title}
                  </h2>
                </div>
              </div>

              <div className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-medium text-text-slate-muted dark:bg-inverse-surface">
                {activeStep.metricsOrHighlight}
              </div>
            </div>

            {/* Visual Graphic Component */}
            <div className="overflow-hidden rounded-xl">
              <WorkflowVisual step={activeStep} />
            </div>

            {/* Objective */}
            <div className="rounded-xl border border-border-outline-variant/50 bg-surface-container-low/30 p-4 dark:border-outline/30 dark:bg-inverse-surface/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-charcoal dark:text-inverse-on-surface">
                Analytical Objective
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-slate-muted md:text-sm">
                {activeStep.objective}
              </p>
            </div>

            {/* Key Activities Checklist */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-charcoal dark:text-inverse-on-surface mb-2">
                Key Analytical Steps & Methods
              </h3>
              <ul className="space-y-2">
                {activeStep.keyActivities.map((act, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-text-slate-muted md:text-[13px] leading-relaxed"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      ✓
                    </span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
