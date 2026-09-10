"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { FormattedText } from "@/components/formatted-text";
import { PRESENTATION_SLIDES } from "./slides-data";

const axisStyle = { fontSize: 12.5, fill: "#475569" };
const gridColor = "#e2e8f0";

export function PresentationDeck() {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const total = PRESENTATION_SLIDES.length;
  const slide = PRESENTATION_SLIDES[current];

  const goToNext = useCallback(() => {
    setCurrent((prev) => (prev < total - 1 ? prev + 1 : prev));
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrent((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < total) {
      setCurrent(index);
      setOverviewOpen(false);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToPrev();
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setNotesOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        setOverviewOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrent(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrent(total - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, total]);

  // Autoplay slideshow
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev < total - 1 ? prev + 1 : 0));
    }, 8500);
    return () => clearInterval(interval);
  }, [isPlaying, total]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen bg-slate-950 flex flex-col p-0 overflow-hidden"
          : "w-full"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Presentation Deck Card */}
      <div
        className={`relative flex flex-1 flex-col overflow-hidden bg-surface-lowest ${
          isFullscreen
            ? "h-full w-full rounded-none border-0 shadow-none"
            : "rounded-md border border-outline shadow-md"
        }`}
      >
        {/* Top Progress Bar */}
        <div className="h-1.5 w-full bg-surface-container shrink-0">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>

        {/* Presentation Header Bar */}
        <header className={`flex flex-wrap items-center justify-between gap-3 border-b border-outline bg-surface-lowest px-5 shrink-0 ${isFullscreen ? "py-2" : "py-3"}`}>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3.5 py-0.5 text-sm font-bold uppercase tracking-wider text-primary">
              {slide.category}
            </span>
            <span className="hidden text-sm text-slate sm:inline">·</span>
            <span className="text-sm font-semibold text-slate">{slide.badge}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-data text-sm font-bold text-slate">
              SLIDE {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setNotesOpen((n) => !n)}
                className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
                  notesOpen
                    ? "border-secondary bg-secondary text-on-secondary shadow-xs"
                    : "border-outline text-slate hover:bg-surface-dim hover:text-charcoal"
                }`}
                title="Presenter Notes (N)"
              >
                Notes [N]
              </button>
              <button
                type="button"
                onClick={() => setOverviewOpen((o) => !o)}
                className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
                  overviewOpen
                    ? "border-primary bg-primary text-on-primary shadow-xs"
                    : "border-outline text-slate hover:bg-surface-dim hover:text-charcoal"
                }`}
                title="Slide Grid (O)"
              >
                Grid [O]
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
                  isPlaying
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline text-slate hover:bg-surface-dim hover:text-charcoal"
                }`}
                title={isPlaying ? "Pause autoplay" : "Start autoplay (8.5s)"}
              >
                {isPlaying ? "Pause ❚❚" : "Play ▶"}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded border border-outline px-3 py-1.5 text-sm font-medium text-slate hover:bg-surface-dim hover:text-charcoal"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? "Exit Full ⤓" : "Full [F] ⛶"}
              </button>
            </div>
          </div>
        </header>

        {/* Slide Stage Wrapper with Vertically Centered Left/Right Navigation Arrows */}
        <div className={`relative flex flex-1 flex-col ${isFullscreen ? "overflow-hidden h-full" : "overflow-y-auto"}`}>
          {/* Left Navigation Arrow */}
          <button
            type="button"
            onClick={goToPrev}
            disabled={current === 0}
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex ${isFullscreen ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-12 sm:w-12"} items-center justify-center rounded-full border border-outline bg-surface-lowest/95 text-charcoal shadow-md backdrop-blur-sm transition-all hover:border-primary hover:bg-surface-lowest hover:text-primary hover:scale-105 active:scale-95 ${
              current === 0
                ? "cursor-not-allowed opacity-20 pointer-events-none"
                : "cursor-pointer"
            }`}
            aria-label="Previous slide"
            title="Previous slide (←)"
          >
            <svg className={`${isFullscreen ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5 sm:h-6 sm:w-6"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={goToNext}
            disabled={current === total - 1}
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex ${isFullscreen ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-12 sm:w-12"} items-center justify-center rounded-full border border-outline bg-surface-lowest/95 text-charcoal shadow-md backdrop-blur-sm transition-all hover:border-primary hover:bg-surface-lowest hover:text-primary hover:scale-105 active:scale-95 ${
              current === total - 1
                ? "cursor-not-allowed opacity-20 pointer-events-none"
                : "cursor-pointer"
            }`}
            aria-label="Next slide"
            title="Next slide (→)"
          >
            <svg className={`${isFullscreen ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5 sm:h-6 sm:w-6"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Stage Body */}
          <main
            className={`flex flex-1 flex-col justify-between px-6 sm:px-12 md:px-16 ${
              isFullscreen
                ? "py-2.5 max-w-[1600px] mx-auto w-full h-full overflow-hidden"
                : "py-8 md:min-h-[520px]"
            }`}
          >
            <div className={`flex flex-1 flex-col ${isFullscreen ? "min-h-0 overflow-hidden" : ""}`}>
              {/* Slide Title & Subtitle */}
              <div className="max-w-5xl shrink-0">
                <h2 className={`font-black tracking-tight text-charcoal leading-tight ${
                  isFullscreen ? "text-xl sm:text-2xl lg:text-3xl" : "text-3xl sm:text-4xl lg:text-[2.65rem]"
                }`}>
                  {slide.title}
                </h2>
                {slide.subtitle ? (
                  <p className={`leading-snug text-on-variant ${
                    isFullscreen ? "mt-1 text-xs sm:text-sm max-w-4xl" : "mt-2 text-base leading-relaxed sm:text-lg"
                  }`}>
                    {slide.subtitle}
                  </p>
                ) : null}
              </div>

              {/* Slide Content Dynamic Switcher */}
              <div className={`flex-1 flex flex-col justify-center ${isFullscreen ? "mt-2 min-h-0" : "mt-6"}`}>
                {/* 1. TITLE SLIDE */}
                {slide.type === "title" && (
                  <div className={isFullscreen ? "space-y-3" : "space-y-6"}>
                    <div className={`rounded-lg border border-outline bg-surface-dim ${isFullscreen ? "p-3 sm:p-4" : "p-6"}`}>
                      <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate">
                        Project Analytics & Engineering Team
                      </p>
                      <div className={`flex flex-wrap gap-2 ${isFullscreen ? "mt-2" : "mt-3"}`}>
                        {slide.teamMembers?.map((member, i) => (
                          <span
                            key={i}
                            className={`rounded-full border border-outline bg-surface-lowest font-semibold text-charcoal shadow-xs ${
                              isFullscreen ? "px-3 py-1 text-xs sm:text-sm" : "px-4.5 py-2 text-sm"
                            }`}
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`grid gap-3 sm:grid-cols-3 ${isFullscreen ? "" : "gap-4"}`}>
                      {slide.techStack?.map((spec, i) => (
                        <div
                          key={i}
                          className={`rounded border border-outline bg-surface-lowest shadow-2xs ${
                            isFullscreen ? "p-2.5 sm:p-3" : "p-4"
                          }`}
                        >
                          <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">
                            {spec.label}
                          </p>
                          <p className={`font-medium text-charcoal ${isFullscreen ? "mt-0.5 text-sm sm:text-base" : "mt-1 text-base"}`}>
                            {spec.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. ARCHITECTURE SLIDE */}
                {slide.type === "architecture" && (
                  <div className={`grid gap-4 lg:grid-cols-12 ${isFullscreen ? "items-stretch" : "gap-6"}`}>
                    <div className={`rounded border-l-4 border-primary border-t border-r border-b border-outline bg-surface-lowest lg:col-span-6 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div className="flex items-center justify-between border-b border-outline pb-2">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                          7 Harmonized Public Health Datasets
                        </h3>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          SQLite Relational Joins
                        </span>
                      </div>
                      <div className={`grid gap-1.5 ${isFullscreen ? "mt-2" : "mt-3 gap-2"}`}>
                        {slide.datasets?.map((ds) => (
                          <div
                            key={ds.id}
                            className={`rounded border border-outline bg-surface-dim text-xs ${isFullscreen ? "px-2.5 py-1.5" : "px-3 py-2"}`}
                          >
                            <span className="font-bold text-primary">{ds.id}. {ds.name}: </span>
                            <span className="text-on-variant">{ds.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`flex flex-col justify-between rounded border-l-4 border-secondary border-t border-r border-b border-outline bg-surface-lowest lg:col-span-6 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="border-b border-outline pb-2">
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                            Dual-Track Disambiguation Matrix
                          </h3>
                        </div>
                        <div className="mt-2 overflow-x-auto">
                          <table className="min-w-full text-left text-xs">
                            <thead className="bg-surface-dim font-bold text-charcoal">
                              <tr>
                                <th className="p-1.5 border-b border-outline">Track</th>
                                <th className="p-1.5 border-b border-outline">Scale</th>
                                <th className="p-1.5 border-b border-outline">Public Health Utility</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline">
                              {slide.disambiguationRows?.map((row, i) => (
                                <tr key={i} className="hover:bg-surface-dim/50">
                                  <td className="p-1.5 font-bold text-charcoal">{row.track}</td>
                                  <td className="p-1.5 font-data text-primary font-semibold">{row.metric}</td>
                                  <td className="p-1.5 text-on-variant">{row.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className={`rounded bg-secondary/10 border-l-3 border-secondary text-xs text-on-variant ${isFullscreen ? "mt-2 p-2" : "mt-4 p-3"}`}>
                        <strong className="text-secondary font-bold">Data Engineering Triumph: </strong>
                        Cleaning isolated 9 CCHS records strictly to work stress. Separating <code className="font-mono bg-surface-lowest px-1 py-0.5 rounded">_pct</code> from <code className="font-mono bg-surface-lowest px-1 py-0.5 rounded">_n</code> prevented catastrophic double-counting and enabled accurate national headcount projections.
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PERCEIVED HEALTH OVER THE YEARS SLIDE */}
                {slide.type === "longitudinal" && (
                  <div className={`flex flex-col ${isFullscreen ? "gap-2" : "gap-4"}`}>
                    {/* Top: Full-Width Trajectory Line Chart */}
                    <div className={`flex flex-col justify-between rounded border-l-4 border-error border-t border-r border-b border-outline bg-surface-lowest ${isFullscreen ? "p-3" : "p-5"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline pb-2">
                        <div>
                          <h3 className={`font-bold uppercase tracking-wider text-charcoal ${isFullscreen ? "text-sm" : "text-base"}`}>
                            Perceived Mental Health Trajectory (2002–2023)
                          </h3>
                          <p className="text-xs text-slate mt-0.5">
                            Statistics Canada CCHS Longitudinal Surveillance: Fair/Poor vs. Very Good/Excellent
                          </p>
                        </div>
                        <span className="rounded bg-error/10 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-error">
                          +7.5 pp Rate Increase (Doubled Rate)
                        </span>
                      </div>
                      <div className={`mt-2 w-full ${isFullscreen ? "h-40 sm:h-52 md:h-56" : "h-60 sm:h-64"}`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={slide.chartData1}
                            margin={{ top: 8, right: 20, left: -15, bottom: 0 }}
                          >
                            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="period" tick={axisStyle} />
                            <YAxis tick={axisStyle} unit="%" domain={[0, 80]} />
                            <Tooltip
                              formatter={(value, name) => [
                                `${value}%`,
                                name === "poor" ? "Fair / Poor Mental Health" : "Very Good / Excellent",
                              ]}
                              contentStyle={{ fontSize: 12, borderRadius: 6, backgroundColor: "#fff", borderColor: "#e2e8f0" }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                              formatter={(value) =>
                                value === "poor" ? "Fair or Poor (Distress)" : "Very Good or Excellent (Resilience)"
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey="poor"
                              stroke="#ba1a1a"
                              strokeWidth={3}
                              dot={{ r: 3, fill: "#ba1a1a" }}
                              activeDot={{ r: 5 }}
                              name="poor"
                            />
                            <Line
                              type="monotone"
                              dataKey="good"
                              stroke="#00685f"
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              dot={{ r: 3, fill: "#00685f" }}
                              activeDot={{ r: 5 }}
                              name="good"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Executive Takeaway Card placed right below the chart */}
                    <div className={`flex flex-col gap-1.5 rounded border-l-4 border-primary bg-surface-dim shrink-0 ${isFullscreen ? "p-2.5 sm:p-3" : "py-4.5 px-5"}`}>
                      <p className={`font-medium text-charcoal leading-snug ${isFullscreen ? "text-xs sm:text-sm" : "text-sm md:text-base"}`}>
                        <span className="font-bold text-primary">Executive Takeaway: </span>
                        <FormattedText text={slide.takeaway} />
                      </p>
                    </div>

                    {/* Bottom: Full-Width Key Population Health Signals Card */}
                    <div className={`flex flex-col justify-between rounded border-l-4 border-primary border-t border-r border-b border-outline bg-surface-lowest ${isFullscreen ? "p-3 sm:p-3.5" : "p-6"}`}>
                      <div className="flex items-center justify-between border-b border-outline pb-1.5">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                          Key Population Health Signals
                        </h3>
                        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate">
                          Macro Surveillance Indicators
                        </span>
                      </div>

                      {/* 3 Stats Grid */}
                      <div className={`grid grid-cols-1 sm:grid-cols-3 ${isFullscreen ? "mt-2.5 gap-2.5" : "mt-3.5 gap-3.5"}`}>
                        {slide.stats?.map((stat, i) => (
                          <div
                            key={i}
                            className={`flex flex-col justify-between rounded border transition ${
                              isFullscreen ? "p-2.5 sm:p-3 min-h-[88px]" : "p-4 sm:p-4.5 min-h-[120px]"
                            } ${
                              stat.highlight
                                ? "border-error/30 bg-error/5"
                                : "border-outline bg-surface-dim"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate">{stat.label}</p>
                              {stat.delta && (
                                <span
                                  className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${
                                    stat.color === "red"
                                      ? "bg-error/10 text-error"
                                      : stat.color === "teal"
                                      ? "bg-secondary/10 text-secondary"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {stat.delta}
                                </span>
                              )}
                            </div>
                            <p
                              className={`font-data font-black ${
                                isFullscreen ? "mt-1 text-xl sm:text-2xl" : "mt-2 text-3xl"
                              } ${
                                stat.color === "red"
                                  ? "text-error"
                                  : stat.color === "teal"
                                  ? "text-secondary"
                                  : "text-primary"
                              }`}
                            >
                              {stat.value}
                            </p>
                            <p className="text-xs text-on-variant mt-1">{stat.subtext}</p>
                          </div>
                        ))}
                      </div>

                      {/* Narrative Highlights Grid */}
                      <div className={`grid grid-cols-1 md:grid-cols-3 pt-2 border-t border-outline ${isFullscreen ? "mt-2 gap-2" : "mt-3.5 gap-3.5 pt-2.5"}`}>
                        {slide.bulletPoints?.map((bp, i) => (
                          <div key={i} className={`flex items-start gap-1.5 text-xs text-on-variant leading-snug rounded bg-surface-dim/60 border border-outline/50 ${isFullscreen ? "p-2 sm:p-2.5 min-h-[52px]" : "p-3.5 sm:py-4 sm:px-3.5 min-h-[70px] text-sm"}`}>
                            <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{bp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CANNABIS USE VS. CLINICAL DEPENDENCE SLIDE */}
                {slide.type === "cannabis" && (
                  <div className={`grid lg:grid-cols-12 items-stretch ${isFullscreen ? "gap-3" : "gap-6"}`}>
                    <div className={`flex flex-col justify-between rounded border-l-4 border-secondary border-t border-r border-b border-outline bg-surface-lowest lg:col-span-7 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="flex items-center justify-between border-b border-outline pb-2">
                          <div>
                            <h3 className={`font-bold uppercase tracking-wider text-charcoal ${isFullscreen ? "text-xs sm:text-sm" : "text-base"}`}>
                              Cannabis Adoption vs. Clinical Dependence (2012 vs. 2022)
                            </h3>
                            <p className="text-xs text-slate mt-0.5">
                              Statistics Canada CCHS 2012 vs. MHACS 2022 Post-Legalization Microdata
                            </p>
                          </div>
                          <span className="rounded bg-secondary/10 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-secondary">
                            Social Decoupling
                          </span>
                        </div>
                        <div className={`w-full ${isFullscreen ? "mt-2 h-44 sm:h-52 md:h-56" : "mt-4 h-60 sm:h-64"}`}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={slide.chartData1}
                              margin={{ top: 8, right: 15, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid stroke={gridColor} vertical={false} />
                              <XAxis dataKey="indicator" tick={{ ...axisStyle, fontSize: 11 }} />
                              <YAxis tick={axisStyle} unit="%" domain={[0, 55]} />
                              <Tooltip
                                formatter={(value, name) => [
                                  `${value}%`,
                                  name === "baseline" ? "2012 Baseline (Pre-Legalization)" : "2022 Post-Legalization",
                                ]}
                                contentStyle={{ fontSize: 12, borderRadius: 6, backgroundColor: "#fff", borderColor: "#e2e8f0" }}
                              />
                              <Legend
                                wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                                formatter={(value) =>
                                  value === "baseline" ? "2012 Baseline (Pre-Legalization)" : "2022 Post-Legalization (MHACS)"
                                }
                              />
                              <Bar dataKey="baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} name="baseline" />
                              <Bar dataKey="post" fill="#00685f" radius={[4, 4, 0, 0]} name="post" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className={`rounded bg-secondary/10 border-l-3 border-secondary text-xs text-on-variant ${isFullscreen ? "mt-2 p-2" : "mt-4 p-3 text-sm"}`}>
                        <strong className="text-secondary font-bold">Policy & Clinical Takeaway: </strong>
                        Legalization unlocked significant commercial and recreational access (+80% relative growth in 12-month use), while clinical dependence remained flat (1.3% &rarr; 1.4%). Social adoption did not translate into an addiction epidemic.
                      </div>
                    </div>

                    <div className={`flex flex-col justify-between rounded border-l-4 border-primary border-t border-r border-b border-outline bg-surface-lowest lg:col-span-5 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="border-b border-outline pb-2">
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                            Surveillance & Adoption Insights
                          </h3>
                        </div>

                        <div className={`grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 ${isFullscreen ? "mt-2 gap-2" : "mt-3 gap-2.5"}`}>
                          {slide.stats?.map((stat, i) => (
                            <div
                              key={i}
                              className={`rounded border transition ${isFullscreen ? "p-2 sm:p-2.5" : "p-3.5"} ${
                                stat.highlight
                                  ? "border-secondary/30 bg-secondary/5"
                                  : "border-outline bg-surface-dim"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate">{stat.label}</p>
                                {stat.delta && (
                                  <span
                                    className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${
                                      stat.color === "teal"
                                        ? "bg-secondary/10 text-secondary"
                                        : stat.color === "purple"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-primary/10 text-primary"
                                    }`}
                                  >
                                    {stat.delta}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`font-data font-black ${isFullscreen ? "mt-0.5 text-xl sm:text-2xl" : "mt-1 text-3xl"} ${
                                  stat.color === "teal"
                                    ? "text-secondary"
                                    : stat.color === "purple"
                                    ? "text-purple-700"
                                    : "text-primary"
                                }`}
                              >
                                {stat.value}
                              </p>
                              <p className="text-xs text-on-variant mt-0.5">{stat.subtext}</p>
                            </div>
                          ))}
                        </div>

                        <div className={`space-y-1.5 ${isFullscreen ? "mt-2" : "mt-3 space-y-2"}`}>
                          {slide.bulletPoints?.map((bp, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-on-variant leading-snug">
                              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                              <span>{bp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. YOUTH MENTAL HEALTH & AGE DIFFERENCES SLIDE */}
                {slide.type === "youth_mental_health" && (
                  <div className={`grid lg:grid-cols-12 items-stretch ${isFullscreen ? "gap-3" : "gap-6"}`}>
                    <div className={`flex flex-col justify-between rounded border-l-4 border-purple-600 border-t border-r border-b border-outline bg-surface-lowest lg:col-span-7 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="flex items-center justify-between border-b border-outline pb-2">
                          <div>
                            <h3 className={`font-bold uppercase tracking-wider text-charcoal ${isFullscreen ? "text-xs sm:text-sm" : "text-base"}`}>
                              Mental Health Rates Across Age Groups (2022)
                            </h3>
                            <p className="text-xs text-slate mt-0.5">
                              Statistics Canada MHACS 2022 Survey: Anxiety, Mood Disorders, and Diagnosed PTSD
                            </p>
                          </div>
                          <span className="rounded bg-purple-100 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-purple-700">
                            Youth Most Impacted
                          </span>
                        </div>
                        <div className={`w-full ${isFullscreen ? "mt-2 h-44 sm:h-52 md:h-56" : "mt-4 h-60 sm:h-64"}`}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={slide.chartData1}
                              margin={{ top: 8, right: 15, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid stroke={gridColor} vertical={false} />
                              <XAxis dataKey="cohort" tick={{ ...axisStyle, fontSize: 11 }} />
                              <YAxis tick={axisStyle} unit="%" domain={[0, 25]} />
                              <Tooltip
                                formatter={(value, name) => [
                                  `${value}%`,
                                  name === "anxiety"
                                    ? "Anxiety Disorders"
                                    : name === "mood"
                                    ? "Mood Disorders (Depression)"
                                    : "Diagnosed PTSD",
                                ]}
                                contentStyle={{ fontSize: 12, borderRadius: 6, backgroundColor: "#fff", borderColor: "#e2e8f0" }}
                              />
                              <Legend
                                wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                                formatter={(value) =>
                                  value === "anxiety"
                                    ? "Anxiety (20.2% in Youth)"
                                    : value === "mood"
                                    ? "Mood / Depression (16.1% in Youth)"
                                    : "PTSD (Peaks in Adults)"
                                }
                              />
                              <Bar dataKey="anxiety" fill="#7c3aed" radius={[4, 4, 0, 0]} name="anxiety" />
                              <Bar dataKey="mood" fill="#0284c7" radius={[4, 4, 0, 0]} name="mood" />
                              <Bar dataKey="ptsd" fill="#d97706" radius={[4, 4, 0, 0]} name="ptsd" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className={`rounded bg-purple-50 border-l-3 border-purple-600 text-xs text-on-variant ${isFullscreen ? "mt-2 p-2" : "mt-4 p-3 text-sm"}`}>
                        <strong className="text-purple-800 font-bold">Key Pattern: </strong>
                        Anxiety and mood challenges are highest among young people (15–24) and decline as people age. In contrast, PTSD peaks in working adults aged 25 to 64 due to cumulative life and workplace stress.
                      </div>
                    </div>

                    <div className={`flex flex-col justify-between rounded border-l-4 border-primary border-t border-r border-b border-outline bg-surface-lowest lg:col-span-5 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="border-b border-outline pb-2">
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                            Age Breakdown & Key Numbers
                          </h3>
                        </div>

                        <div className={`grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 ${isFullscreen ? "mt-2 gap-2" : "mt-3 gap-2.5"}`}>
                          {slide.stats?.map((stat, i) => (
                            <div
                              key={i}
                              className={`rounded border transition ${isFullscreen ? "p-2 sm:p-2.5" : "p-3.5"} ${
                                stat.highlight
                                  ? "border-purple-300 bg-purple-50/60"
                                  : "border-outline bg-surface-dim"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate">{stat.label}</p>
                                {stat.delta && (
                                  <span
                                    className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${
                                      stat.color === "purple"
                                        ? "bg-purple-100 text-purple-700"
                                        : stat.color === "blue"
                                        ? "bg-sky-100 text-sky-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {stat.delta}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`font-data font-black ${isFullscreen ? "mt-0.5 text-xl sm:text-2xl" : "mt-1 text-3xl"} ${
                                  stat.color === "purple"
                                    ? "text-purple-700"
                                    : stat.color === "blue"
                                    ? "text-sky-700"
                                    : "text-amber-700"
                                }`}
                              >
                                {stat.value}
                              </p>
                              <p className="text-xs text-on-variant mt-0.5">{stat.subtext}</p>
                            </div>
                          ))}
                        </div>

                        <div className={`space-y-1.5 ${isFullscreen ? "mt-2" : "mt-3 space-y-2"}`}>
                          {slide.bulletPoints?.map((bp, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-on-variant leading-snug">
                              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600" />
                              <span>{bp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. HOW HOUSEHOLD INCOME IMPACTS MENTAL HEALTH SLIDE */}
                {slide.type === "income_mental_health" && (
                  <div className={`grid lg:grid-cols-12 items-stretch ${isFullscreen ? "gap-3" : "gap-6"}`}>
                    <div className={`flex flex-col justify-between rounded border-l-4 border-amber-600 border-t border-r border-b border-outline bg-surface-lowest lg:col-span-7 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="flex items-center justify-between border-b border-outline pb-2">
                          <div>
                            <h3 className={`font-bold uppercase tracking-wider text-charcoal ${isFullscreen ? "text-xs sm:text-sm" : "text-base"}`}>
                              Fair or Poor Mental Health by Household Income (2022)
                            </h3>
                            <p className="text-xs text-slate mt-0.5">
                              Statistics Canada MHACS 2022: Percentage Reporting Fair or Poor Mental Health
                            </p>
                          </div>
                          <span className="rounded bg-amber-100 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-amber-800">
                            3.52× Income Gap
                          </span>
                        </div>
                        <div className={`w-full ${isFullscreen ? "mt-2 h-44 sm:h-52 md:h-56" : "mt-4 h-60 sm:h-64"}`}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={slide.chartData1}
                              layout="vertical"
                              margin={{ top: 8, right: 20, left: 30, bottom: 0 }}
                            >
                              <CartesianGrid stroke={gridColor} horizontal={false} />
                              <XAxis type="number" tick={axisStyle} unit="%" domain={[0, 25]} />
                              <YAxis dataKey="income" type="category" tick={{ ...axisStyle, fontSize: 11 }} />
                              <Tooltip
                                formatter={(val) => [`${val}%`, "Fair or Poor Rate"]}
                                contentStyle={{ fontSize: 12, borderRadius: 6, backgroundColor: "#fff", borderColor: "#e2e8f0" }}
                              />
                              <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                                {slide.chartData1?.map((entry, idx) => (
                                  <Cell
                                    key={`cell-${idx}`}
                                    fill={
                                      idx === 0
                                        ? "#ba1a1a"
                                        : idx === 1
                                        ? "#ea580c"
                                        : idx === 2
                                        ? "#eab308"
                                        : idx === 3
                                        ? "#0284c7"
                                        : "#00685f"
                                    }
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className={`rounded bg-amber-50 border-l-3 border-amber-600 text-xs text-on-variant ${isFullscreen ? "mt-2 p-2" : "mt-4 p-3 text-sm"}`}>
                        <strong className="text-amber-800 font-bold">Key Pattern: </strong>
                        Financial security strongly protects mental well-being. Individuals living on under $20k face a 3.5× higher rate of distress compared to households earning over $80k, driven by living costs and out-of-pocket therapy costs.
                      </div>
                    </div>

                    <div className={`flex flex-col justify-between rounded border-l-4 border-primary border-t border-r border-b border-outline bg-surface-lowest lg:col-span-5 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="border-b border-outline pb-2">
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                            Income Gap & Key Numbers
                          </h3>
                        </div>

                        <div className={`grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 ${isFullscreen ? "mt-2 gap-2" : "mt-3 gap-2.5"}`}>
                          {slide.stats?.map((stat, i) => (
                            <div
                              key={i}
                              className={`rounded border transition ${isFullscreen ? "p-2 sm:p-2.5" : "p-3.5"} ${
                                stat.highlight
                                  ? "border-error/30 bg-error/5"
                                  : "border-outline bg-surface-dim"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate">{stat.label}</p>
                                {stat.delta && (
                                  <span
                                    className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${
                                      stat.color === "red"
                                        ? "bg-error/10 text-error"
                                        : stat.color === "teal"
                                        ? "bg-secondary/10 text-secondary"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {stat.delta}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`font-data font-black ${isFullscreen ? "mt-0.5 text-xl sm:text-2xl" : "mt-1 text-3xl"} ${
                                  stat.color === "red"
                                    ? "text-error"
                                    : stat.color === "teal"
                                    ? "text-secondary"
                                    : "text-amber-700"
                                }`}
                              >
                                {stat.value}
                              </p>
                              <p className="text-xs text-on-variant mt-0.5">{stat.subtext}</p>
                            </div>
                          ))}
                        </div>

                        <div className={`space-y-1.5 ${isFullscreen ? "mt-2" : "mt-3 space-y-2"}`}>
                          {slide.bulletPoints?.map((bp, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-on-variant leading-snug">
                              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                              <span>{bp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GENDER PARADOX SLIDE */}
                {slide.type === "gender_paradox" && (
                  <div className={`grid lg:grid-cols-12 ${isFullscreen ? "gap-3" : "gap-6"}`}>
                    <div className={`rounded border-l-4 border-error border-t border-r border-b border-outline bg-surface-lowest lg:col-span-6 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div className="flex items-center justify-between border-b border-outline pb-2">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                          Self-Reported Distress vs. Suicide Mortality
                        </h3>
                        <span className="text-xs sm:text-sm font-bold text-error">4.64× Lethality Gap</span>
                      </div>
                      <div className={`w-full ${isFullscreen ? "mt-2 h-40 sm:h-48 md:h-52" : "mt-3 h-56"}`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={slide.chartData1}
                            margin={{ top: 5, right: 15, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid stroke={gridColor} vertical={false} />
                            <XAxis dataKey="metric" tick={{ ...axisStyle, fontSize: 11 }} />
                            <YAxis tick={axisStyle} />
                            <Tooltip
                              formatter={(value, name) => [
                                `${value}`,
                                name === "men" ? "Men+" : "Women+",
                              ]}
                              contentStyle={{ fontSize: 12, borderRadius: 4, backgroundColor: "#fff" }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                              formatter={(value) => (value === "men" ? "Men+" : "Women+")}
                            />
                            <Bar dataKey="men" fill="#1d68bd" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="women" fill="#ec4899" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className={`rounded bg-error/10 border-l-3 border-error text-xs text-on-variant ${isFullscreen ? "mt-2 p-2" : "mt-3 p-3.5 text-sm"}`}>
                        <strong className="text-error font-bold">The Paradox Defined: </strong>
                        Women exhibit significantly higher self-reported illness and outpatient visits (10.2% vs 6.7%), while men experience catastrophic mortality outcomes (16.5 vs 5.4 per 100k) without preceding clinical diagnoses.
                      </div>
                    </div>

                    <div className={`flex flex-col justify-between rounded border-l-4 border-primary border-t border-r border-b border-outline bg-surface-lowest lg:col-span-6 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="border-b border-outline pb-2">
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                            Comparative Disparity Dimensions
                          </h3>
                        </div>
                        <div className="mt-2 overflow-x-auto">
                          <table className="min-w-full text-left text-xs sm:text-sm">
                            <thead className="bg-surface-dim font-bold text-charcoal">
                              <tr>
                                <th className={`border-b border-outline ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>Surveillance Metric</th>
                                <th className={`border-b border-outline ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>Men+</th>
                                <th className={`border-b border-outline ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>Women+</th>
                                <th className={`border-b border-outline ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>Ratio / Disparity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline">
                              {slide.tableData?.map((row, i) => (
                                <tr key={i} className="hover:bg-surface-dim/50">
                                  <td className={`font-medium text-charcoal ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>{String(row.metric)}</td>
                                  <td className={`font-bold text-charcoal ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>{String(row.men)}</td>
                                  <td className={`font-bold text-charcoal ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>{String(row.women)}</td>
                                  <td className={isFullscreen ? "p-1.5" : "p-2.5"}>
                                    <span
                                      className={`rounded px-1.5 py-0.5 font-bold text-[11px] sm:text-xs ${
                                        row.alert
                                          ? "bg-error/10 text-error"
                                          : "bg-primary/10 text-primary"
                                      }`}
                                    >
                                      {String(row.disparity)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className={`rounded bg-surface-dim border border-outline text-xs text-on-variant ${isFullscreen ? "mt-2 p-2" : "mt-4 p-3.5 text-sm"}`}>
                        <strong className="text-charcoal font-bold">Public Health Implication: </strong>
                        Clinical screening cannot rely purely on elective self-disclosure. Male distress manifests through substance use, work stress, and social withdrawal rather than formal diagnostic surveys.
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. PROVINCIAL CONCORDANCE SLIDE */}
                {slide.type === "provincial_concordance" && (
                  <div className={`grid lg:grid-cols-12 ${isFullscreen ? "gap-3" : "gap-6"}`}>
                    <div className={`flex flex-col justify-between rounded border-l-4 border-primary border-t border-r border-b border-outline bg-surface-lowest lg:col-span-6 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="flex items-center justify-between border-b border-outline pb-2">
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                              Provincial Fair/Poor Mental Health (%) [Latest CCHS]
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate mt-0.5">Self-Rated Health across Canadian Provinces</p>
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-primary">Provincial Variance</span>
                        </div>
                        <div className={`w-full ${isFullscreen ? "mt-2 h-40 sm:h-48 md:h-52" : "mt-3 h-56"}`}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={slide.chartData1}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 35, bottom: 0 }}
                            >
                              <CartesianGrid stroke={gridColor} horizontal={false} />
                              <XAxis type="number" tick={axisStyle} unit="%" domain={[0, 25]} />
                              <YAxis dataKey="province" type="category" tick={{ ...axisStyle, fontSize: 11 }} />
                              <Tooltip
                                formatter={(val) => [`${val}%`, "Fair/Poor Rate"]}
                                contentStyle={{ fontSize: 12, borderRadius: 4, backgroundColor: "#fff" }}
                              />
                              <ReferenceLine
                                x={15.3}
                                stroke="#ba1a1a"
                                strokeDasharray="3 3"
                                strokeWidth={2}
                                label={{
                                  value: "Nat. Avg (15.3%)",
                                  position: "insideTopRight",
                                  fill: "#ba1a1a",
                                  fontSize: 10,
                                  fontWeight: 700,
                                }}
                              />
                              <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                                {slide.chartData1?.map((entry, idx) => (
                                  <Cell
                                    key={`cell-prov-${idx}`}
                                    fill={
                                      Number(entry.rate) >= 20
                                        ? "#ba1a1a"
                                        : Number(entry.rate) >= 16
                                        ? "#ea580c"
                                        : Number(entry.rate) <= 10
                                        ? "#00685f"
                                        : "#1d68bd"
                                    }
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* National Average Results Card below chart */}
                      <div className={`rounded border border-primary/20 bg-primary/5 ${isFullscreen ? "mt-2 p-2" : "mt-3 p-3"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
                            Canadian National Average
                          </span>
                          <span className="font-data text-xs sm:text-sm font-black text-primary px-2 py-0.5 rounded bg-primary/10">
                            15.3% Fair / Poor
                          </span>
                        </div>
                        <p className={`mt-1 text-on-variant leading-snug ${isFullscreen ? "text-[11px] sm:text-xs" : "text-xs"}`}>
                          <strong>6 of 9 provinces</strong> (led by Nova Scotia at 22.4%, N.W.T. at 18.1%, and Alberta at 17.4%) sit <em>above</em> the 15.3% national average, while Quebec (9.3%), Newfoundland (11.2%), and Manitoba (13.9%) report rates below average.
                        </p>
                      </div>
                    </div>

                    <div className={`flex flex-col justify-between rounded border-l-4 border-purple-600 border-t border-r border-b border-outline bg-surface-lowest lg:col-span-6 ${isFullscreen ? "p-3 sm:p-4" : "p-5"}`}>
                      <div>
                        <div className="border-b border-outline pb-2">
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-charcoal">
                            Provincial Stress Concordance Matrix
                          </h3>
                        </div>
                        <div className="mt-2 overflow-x-auto">
                          <table className="min-w-full text-left text-xs sm:text-sm">
                            <thead className="bg-surface-dim font-bold text-charcoal">
                              <tr>
                                <th className={`border-b border-outline ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>Province</th>
                                <th className={`border-b border-outline ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>Fair/Poor (%)</th>
                                <th className={`border-b border-outline ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>Coping Deficit (%)</th>
                                <th className={`border-b border-outline ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>Rank / Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline">
                              {slide.tableData?.map((row, i) => (
                                <tr
                                  key={i}
                                  className={
                                    row.type === "high"
                                      ? "bg-error/5 hover:bg-error/10"
                                      : row.type === "low"
                                      ? "bg-secondary/10 hover:bg-secondary/15"
                                      : "hover:bg-surface-dim/50"
                                  }
                                >
                                  <td className={`font-bold text-charcoal ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>{String(row.province)}</td>
                                  <td className={`font-bold text-charcoal ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>{String(row.fairPoor)}</td>
                                  <td className={`text-on-variant ${isFullscreen ? "p-1.5 text-xs" : "p-2.5"}`}>{String(row.copingDeficit)}</td>
                                  <td className={isFullscreen ? "p-1.5" : "p-2.5"}>
                                    <span
                                      className={`rounded px-1.5 py-0.5 font-bold text-[11px] sm:text-xs ${
                                        row.type === "high"
                                          ? "bg-error/10 text-error"
                                          : row.type === "low"
                                          ? "bg-secondary/20 text-secondary"
                                          : "bg-slate-100 text-slate"
                                      }`}
                                    >
                                      {String(row.rank)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className={`rounded bg-purple-50 border-l-3 border-purple-600 text-xs text-on-variant space-y-1.5 ${isFullscreen ? "mt-2 p-2" : "mt-3 p-3.5 text-sm space-y-2"}`}>
                        <p>
                          <strong className="text-purple-800 font-bold">Macro Concordance Discovery: </strong>
                          The correlation between everyday life coping deficits and formal clinical diagnoses is exceptionally high across Canadian provinces, confirming that general socioeconomic distress directly feeds hospital diagnosis rates.
                        </p>
                        <p className={`text-purple-900 bg-purple-100/70 rounded border border-purple-200 ${isFullscreen ? "p-1.5 text-[11px]" : "p-2.5 text-xs"}`}>
                          <strong className="font-bold">Data Collection Note on Quebec: </strong>
                          Quebec’s markedly lower reported distress rate (9.3%) is significantly influenced by distinct provincial health survey sampling protocols, linguistic translations, and differing data presentation methods compared to other provinces.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. ROADMAP SLIDE */}
                {slide.type === "roadmap" && (
                  <div className={isFullscreen ? "space-y-3" : "space-y-6"}>
                    <div className={`grid gap-3 md:grid-cols-3 ${isFullscreen ? "" : "gap-4"}`}>
                      {slide.pillars?.map((pillar, i) => (
                        <div
                          key={i}
                          className={`flex flex-col justify-between rounded border-l-4 border-t border-r border-b border-outline bg-surface-lowest shadow-xs ${
                            isFullscreen ? "p-3 sm:p-3.5" : "p-5"
                          } ${
                            pillar.accent === "red"
                              ? "border-l-error"
                              : pillar.accent === "purple"
                              ? "border-l-purple-600"
                              : pillar.accent === "teal"
                              ? "border-l-secondary"
                              : "border-l-primary"
                          }`}
                        >
                          <div>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 font-bold ${
                                isFullscreen ? "text-[10px] sm:text-xs" : "text-xs px-2.5"
                              } ${
                                pillar.accent === "red"
                                  ? "bg-error/10 text-error"
                                  : pillar.accent === "purple"
                                  ? "bg-purple-100 text-purple-700"
                                  : pillar.accent === "teal"
                                  ? "bg-secondary/15 text-secondary"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {pillar.tag}
                            </span>
                            <h3 className={`font-bold text-charcoal ${isFullscreen ? "mt-1 text-sm sm:text-base" : "mt-2.5 text-lg"}`}>
                              {pillar.title}
                            </h3>
                            <p className={`text-on-variant ${isFullscreen ? "mt-1 text-xs leading-snug" : "mt-1.5 text-sm"}`}>
                              {pillar.description}
                            </p>
                            <ul className={`border-t border-outline/50 ${isFullscreen ? "mt-1.5 space-y-1 pt-1.5" : "mt-3 space-y-2 pt-2.5"}`}>
                              {pillar.bullets?.map((bullet, idx) => (
                                <li key={idx} className={`flex items-start gap-1.5 text-slate ${isFullscreen ? "text-xs" : "text-sm gap-2"}`}>
                                  <span className="font-bold text-primary">▸</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className={`border-t border-outline ${isFullscreen ? "mt-2 pt-1.5" : "mt-4 pt-2.5"}`}>
                            <p className="text-[11px] sm:text-xs font-bold uppercase text-slate">Strategic Action:</p>
                            <p className={`font-semibold text-charcoal ${isFullscreen ? "mt-0.5 text-xs sm:text-sm" : "mt-0.5 text-sm"}`}>{pillar.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`flex flex-col gap-2 rounded border border-outline bg-surface-dim sm:flex-row sm:items-center sm:justify-between ${
                      isFullscreen ? "p-2.5 text-xs" : "p-4"
                    }`}>
                      <div>
                        <p className={`font-bold text-charcoal ${isFullscreen ? "text-xs sm:text-sm" : "text-sm"}`}>
                          Explore Live Analytics & Data Pipelines
                        </p>
                        <p className={`text-on-variant ${isFullscreen ? "text-xs" : "text-sm"}`}>
                          Access the complete interactive dashboard, KPI scorecard, and data cleaning workflows.
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link
                          href="/dashboard"
                          className={`rounded border border-outline bg-surface-lowest font-semibold text-charcoal hover:border-primary hover:text-primary ${
                            isFullscreen ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
                          }`}
                        >
                          Open Live Dashboard →
                        </Link>
                        <Link
                          href="/workflow"
                          className={`rounded border border-outline bg-surface-lowest font-semibold text-charcoal hover:border-primary hover:text-primary ${
                            isFullscreen ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
                          }`}
                        >
                          View Data Workflow →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Slide Bottom Takeaway Callout (hidden on longitudinal slide as it is positioned directly under the chart) */}
            {slide.type !== "longitudinal" && (
              <div className={`flex flex-col gap-1.5 rounded border-l-4 border-primary bg-surface-dim sm:flex-row sm:items-center sm:justify-between shrink-0 ${
                isFullscreen ? "mt-2 p-2 sm:p-2.5" : "mt-6 p-4"
              }`}>
                <p className={`font-medium text-charcoal leading-snug ${isFullscreen ? "text-xs sm:text-sm" : "text-sm md:text-base leading-relaxed"}`}>
                  <span className="font-bold text-primary">Executive Takeaway: </span>
                  <FormattedText text={slide.takeaway} />
                </p>
              </div>
            )}
          </main>
        </div>

        {/* Slide Deck Bottom Control Bar */}
        <footer className={`flex flex-wrap items-center justify-between gap-4 border-t border-outline bg-surface-container px-5 shrink-0 ${isFullscreen ? "py-2" : "py-3"}`}>
          {/* Slide Counter */}
          <div className="flex items-center gap-2">
            <span className="font-data text-sm font-bold text-slate">
              Slide {current + 1} of {total}
            </span>
          </div>

          {/* Slide Indicator Dots / Jumpers */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {PRESENTATION_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === current ? "w-8 bg-primary" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Jump to Slide ${idx + 1}: ${s.title}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right Action Controls: Keyboard Hint & Autoplay */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate lg:inline">
              Use <kbd className="rounded border border-outline bg-surface-lowest px-1.5 py-0.5 text-xs font-mono">←</kbd> <kbd className="rounded border border-outline bg-surface-lowest px-1.5 py-0.5 text-xs font-mono">→</kbd> keys
            </span>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
                isPlaying
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline bg-surface-lowest text-slate hover:text-charcoal"
              }`}
            >
              {isPlaying ? "Pause ❚❚" : "Play ▶"}
            </button>
          </div>
        </footer>
      </div>

      {/* Presenter Notes Drawer (Toggle with N) */}
      {notesOpen && (
        <aside className={`${isFullscreen ? "fixed bottom-14 left-4 right-4 z-50 max-h-60" : "mt-4"} rounded border-2 border-secondary bg-slate-900 p-5 text-slate-100 shadow-2xl overflow-y-auto`}>
          <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
            <span className="text-sm font-bold uppercase tracking-wider text-secondary">
              Presenter Speaking Script — Slide {current + 1}: {slide.title}
            </span>
            <button
              type="button"
              onClick={() => setNotesOpen(false)}
              className="text-sm text-slate-400 hover:text-white"
            >
              Close [N] ✕
            </button>
          </div>
          <p className="mt-3 text-base leading-relaxed text-slate-200">
            {slide.speakerNotes}
          </p>
        </aside>
      )}

      {/* Slide Grid Overview Modal (Toggle with O) */}
      {overviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOverviewOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-outline bg-surface-lowest p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <h3 className="text-xl font-bold text-charcoal">
                Slide Deck Directory ({total} Slides)
              </h3>
              <button
                type="button"
                onClick={() => setOverviewOpen(false)}
                className="rounded border border-outline px-3 py-1.5 text-sm font-medium text-slate hover:bg-surface-dim"
              >
                Close [O] ✕
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {PRESENTATION_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`flex flex-col rounded border p-4 text-left transition hover:scale-[1.02] ${
                    idx === current
                      ? "border-primary bg-primary/10 ring-2 ring-primary"
                      : "border-outline bg-surface-dim hover:border-primary hover:bg-surface-lowest"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-data text-xs font-bold text-primary">
                      SLIDE {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-2xs font-semibold uppercase text-slate">
                      {s.category}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-charcoal line-clamp-2">
                    {s.title}
                  </h4>
                  <p className="mt-1 text-sm text-on-variant line-clamp-2">
                    {s.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
