"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PRESENTATION_SLIDES, type SlideData } from "./slides-data";

const axisStyle = { fontSize: 12, fill: "#64748b" };
const gridColor = "#e2e8f0";

export function PresentationDeck() {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
      // Fallback if fullscreen API is blocked
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
      // Ignore when typing in input fields
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
    }, 8000);
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
          ? "fixed inset-0 z-50 h-screen w-screen overflow-y-auto bg-surface p-4 sm:p-8"
          : "w-full"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide Container Card */}
      <div className="relative flex flex-col overflow-hidden border border-outline bg-surface-lowest shadow-sm">
        {/* Top Progress Bar */}
        <div className="h-1.5 w-full bg-surface-container">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>

        {/* Slide Header Banner */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-outline bg-surface-lowest px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-sm border border-outline bg-surface-dim px-2.5 py-0.5 text-xs font-semibold text-primary">
              {slide.category}
            </span>
            <span className="hidden text-xs text-slate sm:inline">·</span>
            <span className="text-xs font-medium text-slate">{slide.badge}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-data text-xs font-semibold text-slate">
              SLIDE {String(current + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className={`rounded border px-2 py-1 text-xs font-medium transition ${
                  isPlaying
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline text-slate hover:bg-surface-dim hover:text-charcoal"
                }`}
                title={isPlaying ? "Pause autoplay" : "Start autoplay (8s/slide)"}
              >
                {isPlaying ? "Pause ❚❚" : "Play ▶"}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded border border-outline px-2 py-1 text-xs font-medium text-slate hover:bg-surface-dim hover:text-charcoal"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? "Exit Fullscreen ⤓" : "Fullscreen ⛶"}
              </button>
            </div>
          </div>
        </header>

        {/* Slide Stage Wrapper with Vertically Centered Left/Right Navigation Arrows */}
        <div className="relative flex flex-1 flex-col">
          {/* Left Arrow Button (Vertically Centered) */}
          <button
            type="button"
            onClick={goToPrev}
            disabled={current === 0}
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-outline bg-surface-lowest/95 text-charcoal shadow-md backdrop-blur-sm transition-all hover:border-primary hover:bg-surface-lowest hover:text-primary hover:scale-105 active:scale-95 ${
              current === 0
                ? "cursor-not-allowed opacity-20 pointer-events-none"
                : "cursor-pointer"
            }`}
            aria-label="Previous slide"
            title="Previous slide (←)"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow Button (Vertically Centered) */}
          <button
            type="button"
            onClick={goToNext}
            disabled={current === total - 1}
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-outline bg-surface-lowest/95 text-charcoal shadow-md backdrop-blur-sm transition-all hover:border-primary hover:bg-surface-lowest hover:text-primary hover:scale-105 active:scale-95 ${
              current === total - 1
                ? "cursor-not-allowed opacity-20 pointer-events-none"
                : "cursor-pointer"
            }`}
            aria-label="Next slide"
            title="Next slide (→)"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Canvas Content (Padded horizontally for side arrows) */}
          <main className="flex flex-1 flex-col justify-between px-8 sm:px-16 md:px-20 py-8 md:min-h-[500px] md:py-10">
          <div>
            {/* Title & Subtitle */}
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-charcoal md:text-3xl">
                {slide.title}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-on-variant md:text-lg">
                {slide.subtitle}
              </p>
            </div>

            {/* Slide Body Based on Type */}
            <div className="mt-8">
              {/* Type: Hero */}
              {slide.type === "hero" && (
                <div className="grid gap-6 md:grid-cols-12">
                  <div className="flex flex-col justify-center space-y-4 border border-outline bg-surface-container p-6 md:col-span-7">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate">
                      Briefing Mandate
                    </p>
                    <p className="text-lg font-medium leading-relaxed text-charcoal">
                      Synthesizing twenty years of Canadian Community Health Survey
                      data into an actionable, decision-ready overview for healthcare
                      leaders and policy authorities.
                    </p>
                    <div className="mt-2 space-y-2 border-t border-outline-strong/30 pt-3">
                      {slide.bulletPoints?.map((bp, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-on-variant">
                          <span className="text-primary font-bold">✓</span>
                          <span>{bp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:col-span-5 md:grid-cols-1">
                    {slide.stats?.map((stat, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-center border border-outline bg-surface-lowest p-5"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-slate">
                          {stat.label}
                        </p>
                        <p className="font-data mt-2 text-3xl font-bold text-primary">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-xs text-on-variant">{stat.subtext}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Type: Metrics */}
              {slide.type === "metrics" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {slide.stats?.map((stat, i) => (
                      <div
                        key={i}
                        className={`border p-5 ${
                          stat.highlight
                            ? "border-primary/40 bg-primary/5"
                            : "border-outline bg-surface-lowest"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                            {stat.label}
                          </p>
                          {stat.trend === "up" && (
                            <span className="text-xs font-bold text-error">▲ Up</span>
                          )}
                          {stat.trend === "down" && (
                            <span className="text-xs font-bold text-slate">▼ Down</span>
                          )}
                        </div>
                        <p
                          className={`font-data mt-3 text-3xl font-bold ${
                            stat.highlight ? "text-primary" : "text-charcoal"
                          }`}
                        >
                          {stat.value}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-on-variant">
                          {stat.subtext}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border border-outline bg-surface-dim p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate">
                      Observed Dynamics
                    </p>
                    <ul className="mt-3 space-y-2">
                      {slide.bulletPoints?.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-on-variant">
                          <span className="font-bold text-primary">▸</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Type: Trajectory Chart */}
              {slide.type === "trajectory" && (
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="border border-outline bg-surface-lowest p-5 lg:col-span-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
                      Canadian Population Perceived Mental Health (2002–2024 CCHS Cycles)
                    </p>
                    <div className="h-64 w-full sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={slide.chartData}
                          margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: gridColor }} />
                          <YAxis tick={axisStyle} axisLine={{ stroke: gridColor }} unit="%" domain={[0, 80]} />
                          <Tooltip
                            formatter={(value: any, name: any) => [
                              `${value}%`,
                              name === "value1"
                                ? "Very Good / Excellent"
                                : "Fair / Poor Distress",
                            ]}
                            contentStyle={{
                              border: "1px solid #e2e8f0",
                              borderRadius: 4,
                              backgroundColor: "#ffffff",
                              fontSize: 12,
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                            formatter={(value) =>
                              value === "value1"
                                ? "Very Good / Excellent"
                                : "Fair or Poor Distress"
                            }
                          />
                          <Line
                            type="monotone"
                            dataKey="value1"
                            stroke="#00685f"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#00685f" }}
                            name="value1"
                          />
                          <Line
                            type="monotone"
                            dataKey="value2"
                            stroke="#ba1a1a"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#ba1a1a" }}
                            name="value2"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between space-y-4 border border-outline bg-surface-dim p-5 lg:col-span-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate">
                        Analysis of Trend
                      </p>
                      <ul className="mt-3 space-y-3">
                        {slide.bulletPoints?.map((bp, i) => (
                          <li key={i} className="text-xs leading-relaxed text-on-variant">
                            • {bp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t border-outline pt-3">
                      <p className="text-xs font-medium text-slate">Data Source</p>
                      <p className="mt-1 text-xs text-on-variant">
                        StatCan CCHS Mental Health Cycles (15+ age cohort).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Type: Geography Chart */}
              {slide.type === "geography" && (
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="border border-outline bg-surface-lowest p-5 lg:col-span-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
                      Provincial Perceived Mental Health Comparison (% Very Good / Excellent)
                    </p>
                    <div className="h-64 w-full sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={slide.chartData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid stroke={gridColor} horizontal={false} />
                          <XAxis type="number" tick={axisStyle} unit="%" domain={[0, 70]} />
                          <YAxis dataKey="name" type="category" tick={{ ...axisStyle, fontSize: 11 }} />
                          <Tooltip
                            formatter={(value: any, name: any) => [
                              `${value}%`,
                              name === "value1" ? "High Wellness" : "Fair/Poor Distress",
                            ]}
                            contentStyle={{
                              border: "1px solid #e2e8f0",
                              borderRadius: 4,
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="value1" fill="#00685f" name="value1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between space-y-4 border border-outline bg-surface-dim p-5 lg:col-span-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate">
                        Geographic Takeaways
                      </p>
                      <ul className="mt-3 space-y-3">
                        {slide.bulletPoints?.map((bp, i) => (
                          <li key={i} className="text-xs leading-relaxed text-on-variant">
                            • {bp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t border-outline pt-3">
                      <Link
                        href="/dashboard/geographic"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Explore interactive province data →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Type: Demographics Chart */}
              {slide.type === "demographics" && (
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="border border-outline bg-surface-lowest p-5 lg:col-span-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
                      Age-Stratified Suicidal Thoughts (%) vs. High Daily Coping Ability (%)
                    </p>
                    <div className="h-64 w-full sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={slide.chartData}
                          margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                        >
                          <CartesianGrid stroke={gridColor} vertical={false} />
                          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: gridColor }} />
                          <YAxis tick={axisStyle} axisLine={{ stroke: gridColor }} unit="%" domain={[0, 80]} />
                          <Tooltip
                            formatter={(value: any, name: any) => [
                              `${value}%`,
                              name === "value1"
                                ? "Suicidal Ideation (Risk)"
                                : "High Coping Ability",
                            ]}
                            contentStyle={{
                              border: "1px solid #e2e8f0",
                              borderRadius: 4,
                              fontSize: 12,
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                            formatter={(value) =>
                              value === "value1"
                                ? "Suicidal Thoughts (Ideation)"
                                : "High Coping Ability"
                            }
                          />
                          <Bar dataKey="value1" fill="#ba1a1a" name="value1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="value2" fill="#00685f" name="value2" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between space-y-4 border border-outline bg-surface-dim p-5 lg:col-span-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate">
                        Youth Vulnerability
                      </p>
                      <ul className="mt-3 space-y-3">
                        {slide.bulletPoints?.map((bp, i) => (
                          <li key={i} className="text-xs leading-relaxed text-on-variant">
                            • {bp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t border-outline pt-3">
                      <Link
                        href="/dashboard/demographics"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        View detailed age breakdowns →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Type: Predictive */}
              {slide.type === "predictive" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {slide.stats?.map((stat, i) => (
                      <div
                        key={i}
                        className={`border p-5 ${
                          stat.highlight
                            ? "border-primary bg-primary/5"
                            : "border-outline bg-surface-lowest"
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                          {stat.label}
                        </p>
                        <p
                          className={`font-data mt-2 text-3xl font-bold ${
                            stat.highlight ? "text-primary" : "text-charcoal"
                          }`}
                        >
                          {stat.value}
                        </p>
                        <p className="mt-1 text-xs text-on-variant">{stat.subtext}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {slide.bulletPoints?.map((bp, i) => (
                      <div
                        key={i}
                        className="border border-outline bg-surface-dim p-4 text-xs leading-relaxed text-on-variant"
                      >
                        <span className="font-bold text-primary">Signal 0{i + 1}: </span>
                        {bp}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Type: Recommendations */}
              {slide.type === "recommendations" && (
                <div className="grid gap-4 md:grid-cols-3">
                  {slide.pillars?.map((pillar, i) => (
                    <div
                      key={i}
                      className="flex flex-col justify-between border border-outline bg-surface-lowest p-6 shadow-xs"
                    >
                      <div>
                        <span className="inline-block rounded-xs bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {pillar.tag}
                        </span>
                        <h3 className="mt-3 text-lg font-bold text-charcoal">
                          {pillar.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-on-variant">
                          {pillar.description}
                        </p>
                      </div>
                      <div className="mt-6 border-t border-outline pt-3">
                        <p className="text-xs font-semibold text-slate">Primary Action:</p>
                        <p className="mt-1 text-xs font-medium text-primary">
                          {pillar.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Type: Governance */}
              {slide.type === "governance" && (
                <div className="space-y-6">
                  <div className="border border-outline bg-surface-container p-6">
                    <h3 className="text-base font-bold text-charcoal">
                      Statistical Standards & Responsible Usage
                    </h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {slide.bulletPoints?.map((bp, i) => (
                        <div
                          key={i}
                          className="border border-outline bg-surface-lowest p-4 text-xs leading-relaxed text-on-variant"
                        >
                          {bp}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {slide.stats?.map((stat, i) => (
                      <Link
                        key={i}
                        href={stat.value}
                        className="group flex flex-col justify-center border border-outline bg-surface-lowest p-5 transition hover:border-primary hover:bg-surface-dim"
                      >
                        <p className="text-xs font-semibold text-slate uppercase">
                          {stat.label}
                        </p>
                        <p className="font-data mt-2 text-xl font-bold text-primary group-hover:underline">
                          {stat.value} →
                        </p>
                        <p className="mt-1 text-xs text-on-variant">{stat.subtext}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Slide Bottom Takeaway Callout */}
          <div className="mt-8 flex flex-col gap-2 rounded-xs border-l-4 border-primary bg-surface-dim p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-charcoal md:text-sm">
              <span className="font-bold text-primary">Executive Takeaway: </span>
              {slide.takeaway}
            </p>
          </div>
        </main>
        </div>

        {/* Slide Deck Bottom Control Bar */}
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-outline bg-surface-container px-6 py-4">
          {/* Slide Counter */}
          <div className="flex items-center gap-2">
            <span className="font-data text-xs font-semibold text-slate">
              Slide {current + 1} of {total}
            </span>
          </div>

          {/* Slide Indicator Dots / Jumpers (Centered) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {PRESENTATION_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === current
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Jump to Slide ${idx + 1}: ${s.title}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right Action Controls: Keyboard Hint, Autoplay, Fullscreen */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate lg:inline">
              Use <kbd className="rounded border border-outline bg-surface-lowest px-1.5 py-0.5 text-xs font-mono">←</kbd> <kbd className="rounded border border-outline bg-surface-lowest px-1.5 py-0.5 text-xs font-mono">→</kbd> keys
            </span>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className={`rounded border px-2.5 py-1 text-xs font-medium transition ${
                isPlaying
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline bg-surface-lowest text-slate hover:text-charcoal"
              }`}
              title={isPlaying ? "Pause autoplay" : "Start autoplay (8s/slide)"}
            >
              {isPlaying ? "Pause ❚❚" : "Play ▶"}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded border border-outline bg-surface-lowest px-2.5 py-1 text-xs font-medium text-slate hover:text-charcoal"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? "Exit Fullscreen ⤓" : "Fullscreen ⛶"}
            </button>
          </div>
        </footer>
      </div>

      {/* Slide Deck Index Grid Quick-Jumper */}
      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate">
          Slide Deck Overview (Click to Navigate)
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {PRESENTATION_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`flex flex-col justify-between border p-3 text-left transition ${
                idx === current
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-outline bg-surface-lowest hover:border-outline-strong hover:bg-surface-dim"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-data text-xs font-bold text-primary">
                  0{idx + 1}
                </span>
                {idx === current && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold text-charcoal">
                {s.category}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
