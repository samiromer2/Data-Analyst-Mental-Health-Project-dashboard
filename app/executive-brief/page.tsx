import Link from "next/link";
import { PresentationDeck } from "@/components/slide-deck/presentation-deck";
import { FormattedText } from "@/components/formatted-text";
import { BreakdownChart, TrendChart } from "@/components/charts/analytics-charts";
import { DataNotice } from "@/components/data-notice";
import { getInsights } from "@/lib/query";
import type { BreakdownPoint, SeriesPoint } from "@/lib/types";

export const metadata = {
  title: "Executive Brief & Insights",
  description:
    "Curated presentation slide deck and synthesized actionable insights across two decades of Canadian population mental health data.",
};

function isSeries(points: SeriesPoint[] | BreakdownPoint[]): points is SeriesPoint[] {
  return points.length > 0 && "period" in points[0];
}

export default async function ExecutiveBriefPage() {
  const insights = await getInsights({});

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-10 md:px-10">
      {/* Page Header */}
      <header className="border-b border-outline pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-block border border-outline bg-surface-lowest px-3 py-1 text-xs font-medium text-slate">
              Population-Level Briefing · Canada
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
              Executive Brief & Insights
            </h1>
            <p className="mt-2 max-w-3xl text-base text-on-variant">
              A curated findings deck synthesizing twenty years of Canadian
              mental health data, followed by deep-dive evidence-backed insights and community actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-outline bg-surface-lowest px-4 py-2 text-sm font-medium text-charcoal transition hover:border-primary hover:text-primary"
            >
              <span>Live Dashboard</span>
              <span>→</span>
            </Link>
            <a
              href="#actionable-insights"
              className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary-container"
            >
              <span>Explore Actionable Insights ↓</span>
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Presentation Deck */}
      <section>
        <PresentationDeck />
      </section>

      {/* Supplemental Executive Context */}
      <section className="grid gap-6 border-t border-outline pt-10 md:grid-cols-3">
        <article className="border border-outline bg-surface-lowest p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Key Metric 01
          </span>
          <h2 className="mt-2 text-lg font-semibold text-charcoal">
            The 20-Year Decline
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-on-variant">
            Between 2002 and 2022, Canadians aged 15+ reporting fair or poor mental
            health <strong className="font-bold text-charcoal">rose from 6.9% in 2002 to 15.3% in 2022</strong>. Over the same cycles, those reporting
            excellent or very good ratings <strong className="font-bold text-charcoal">fell from 67.1% to 53.1%</strong>.
          </p>
        </article>

        <article className="border border-outline bg-surface-lowest p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Key Metric 02
          </span>
          <h2 className="mt-2 text-lg font-semibold text-charcoal">
            Provincial Variance
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-on-variant">
            Mental health outcomes vary dramatically across jurisdictions. In recent
            annual cycles, fair or poor ratings spanned from 8.8% in Quebec to
            19.7% in Nova Scotia, demonstrating that uniform federal programs fail
            to address local distress clusters.
          </p>
        </article>

        <article className="border border-outline bg-surface-lowest p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Key Metric 03
          </span>
          <h2 className="mt-2 text-lg font-semibold text-charcoal">
            Youth Vulnerability
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-on-variant">
            Young adults aged 18 to 34 reported suicidal thoughts at 17.4%—nearly
            2.5 times higher than the 7.0% recorded among seniors 65 and over.
            Youth also reported significantly lower ability to cope with daily
            life demands.
          </p>
        </article>
      </section>

      {/* Integrated Actionable Insights Section */}
      <section
        id="actionable-insights"
        className="scroll-mt-24 border-t border-outline pt-12 flex flex-col gap-8"
      >
        <div>
          <span className="inline-block border border-outline bg-surface-lowest px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Evidence-Grounded Deep Dive
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
            Actionable Insights & Policy Implications
          </h2>
          <p className="mt-2 max-w-3xl text-base text-on-variant">
            So what? Each finding below states the empirical evidence, clarifies what it does not mean,
            and outlines actionable steps for policymakers, healthcare planners, and community leaders.
          </p>
        </div>

        <DataNotice>
          Language stays associational. These are population-level patterns, not individual clinical predictions. CCHS excludes people living on First Nations reserves, in institutions, and full-time military. If suicide-related content is distressing, call or text 9-8-8 in Canada.
        </DataNotice>

        <div className="grid gap-8">
          {insights.map((item) => (
            <article key={item.id} className="border border-outline bg-surface-lowest p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline pb-4">
                <h3 className="text-xl font-bold text-charcoal">{item.title}</h3>
                <span className="rounded bg-surface-dim px-2.5 py-1 text-xs font-medium text-slate">
                  {item.source}
                </span>
              </div>

              <p className="mt-4 text-lg leading-7 font-medium text-charcoal">
                <FormattedText text={item.statement} />
              </p>

              {item.points.length > 0 ? (
                <div className="mt-6 border border-outline bg-surface-dim p-4">
                  {isSeries(item.points) ? (
                    <TrendChart points={item.points} title="Evidence Trend" />
                  ) : (
                    <BreakdownChart
                      points={item.points}
                      title="Evidence Breakdown"
                      layout={item.id === "place" ? "horizontal" : "vertical"}
                    />
                  )}
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 border-t border-outline pt-6 md:grid-cols-2">
                <div className="border border-outline bg-surface-dim p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    What this means
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-variant">{item.meaning}</p>
                </div>
                <div className="border border-outline bg-surface-dim p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    What communities can do
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-variant">{item.action}</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate italic">
                Caveat: {item.caveat}
              </p>

              {item.help ? (
                <div className="mt-4 border border-outline bg-surface-dim px-4 py-3">
                  <p className="text-sm font-medium text-charcoal">
                    If this is you or someone you know
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-variant">{item.help}</p>
                  <p className="mt-2 text-sm leading-6">
                    <a
                      href="https://www.988.ca"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2 hover:text-primary-container"
                    >
                      9-8-8 Suicide Crisis Helpline
                    </a>
                    {" · "}
                    <a
                      href="https://cmha.ca/find-help/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2 hover:text-primary-container"
                    >
                      Find local CMHA support
                    </a>
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {/* Briefing Citation & Workflow Exploration Footer Card */}
      <section className="flex flex-col items-start justify-between gap-6 border border-outline bg-surface-container p-8 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-charcoal">
            Looking to inspect the underlying methodology & pipeline?
          </h3>
          <p className="mt-1 text-sm text-on-variant">
            Inspect the statistical validation, data cleaning, and ETL workflows that power these findings.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="border border-outline bg-surface-lowest px-4 py-2 text-sm font-medium text-charcoal hover:border-primary hover:text-primary"
          >
            Live Dashboard
          </Link>
          <Link
            href="/workflow"
            className="border border-outline bg-surface-lowest px-4 py-2 text-sm font-medium text-charcoal hover:border-primary hover:text-primary"
          >
            View Data Workflow
          </Link>
        </div>
      </section>
    </div>
  );
}

