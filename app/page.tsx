import Link from "next/link";
import { CanadaFlag } from "@/components/canada-flag";
import { FormattedText } from "@/components/formatted-text";
import { getInsights } from "@/lib/query";

const metrics = [
  { label: "Canadian source tables", value: "8", detail: "StatCan and CIHI Track A files" },
  { label: "Provinces and territories", value: "13", detail: "Plus Canada-level estimates" },
  { label: "CCHS cycles in the core table", value: "3", detail: "2019/20 · 2021/22 · 2023/24" },
];

export default async function HomePage() {
  const insights = await getInsights({});
  const headline = insights.find((item) => item.id === "distress" && item.available) ?? insights[0];
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col">
      <section className="grid gap-10 border-b border-outline px-4 py-16 md:px-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="mb-4 inline-block border border-outline bg-surface-lowest px-3 py-1 text-sm text-slate">
            Canada · population-level analysis
          </p>
          <p className="inline-flex items-center text-sm font-medium uppercase tracking-wide text-primary">
            <CanadaFlag className="h-5 w-5 mr-1.5" /> Wellness Metrics
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-charcoal md:text-5xl">
            Mental Health Analytics
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-7 text-on-variant">
            Understanding mental health trends across Canada through data.
            The dashboard answers what is happening. Insights answers what it
            means. Workflow shows how the analysis was done.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/executive-brief"
              className="bg-primary px-6 py-3 text-center text-sm font-medium text-on-primary hover:bg-primary-container"
            >
              Explore Insights (Deck)
            </Link>
            <Link
              href="/dashboard"
              className="border border-primary px-6 py-3 text-center text-sm font-medium text-primary hover:bg-surface-dim"
            >
              Interactive Dashboard
            </Link>
            <Link
              href="/workflow"
              className="border border-outline px-6 py-3 text-center text-sm font-medium text-charcoal hover:bg-surface-dim"
            >
              Data Workflow
            </Link>
          </div>
        </div>
        <div className="border border-outline bg-surface-lowest p-8 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-outline pb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              ★ Star Findings
            </p>
            <span className="text-xs text-slate">Statistics Canada & CIHI</span>
          </div>

          <div className="mt-5 space-y-6">
            {/* Finding 1: Mental Health Trajectory */}
            <div className="border-l-3 border-primary pl-4">
              <h3 className="inline-block rounded border border-primary/20 bg-primary/10 px-3 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                01 · Longitudinal Mental Health Trajectory
              </h3>
              <p className="mt-2 text-base leading-7 text-charcoal font-medium">
                <FormattedText text={headline?.statement ?? "Among people 15 and over in Canada, fair or poor perceived mental health rose from 6.9% in 2002 to 15.3% in 2022. Very good or excellent ratings fell from 67.1% to 53.1% over the same CCHS mental-health cycles."} />
              </p>
            </div>

            {/* Finding 2: Cannabis Decoupling */}
            <div className="border-l-3 border-secondary pl-4">
              <h3 className="inline-block rounded border border-secondary/20 bg-secondary/15 px-3 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-secondary">
                02 · Cannabis Use vs. Clinical Dependence Decoupling
              </h3>
              <p className="mt-2 text-base leading-7 text-charcoal font-medium">
                Past 12-month cannabis use surged by 80% relative (<strong className="font-black text-charcoal underline decoration-secondary/60 underline-offset-2">rose from 12.2% to 22.0%</strong> following legalization), yet reported clinical cannabis abuse or dependence remained statistically flat (<strong className="font-black text-charcoal underline decoration-secondary/60 underline-offset-2">1.3% to 1.4%</strong>)—demonstrating widespread social adoption without an addiction crisis.
              </p>
            </div>

            {/* Finding 3: Youth & Income Disparities */}
            <div className="border-l-3 border-purple-600 pl-4">
              <h3 className="inline-block rounded border border-purple-200 bg-purple-100 px-3 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-800">
                03 · Youth Anxiety & Socioeconomic Gradient
              </h3>
              <p className="mt-2 text-base leading-7 text-charcoal font-medium">
                1 in 5 young Canadians (<strong className="font-black text-charcoal underline decoration-purple-500/60 underline-offset-2">20.2%</strong>) report anxiety disorders, and lower-income households face a <strong className="font-black text-charcoal underline decoration-purple-500/60 underline-offset-2">3.52× higher distress rate</strong> (20.4% under $20k vs. 5.8% for $80k+)—proving that vulnerability is concentrated by age and income.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-outline pt-4">
            <Link
              href="/executive-brief#actionable-insights"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <span>Explore full data insights</span>
              <span>→</span>
            </Link>
            <Link
              href="/executive-brief"
              className="text-xs font-medium text-slate hover:text-primary hover:underline"
            >
              View presentation slide deck →
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-b border-outline px-4 py-12 md:grid-cols-3 md:px-10">
        {metrics.map((metric) => (
          <article key={metric.label} className="border border-outline bg-surface-lowest p-6">
            <p className="text-sm uppercase tracking-wide text-slate">{metric.label}</p>
            <p className="font-data mt-4 text-4xl font-semibold text-primary">{metric.value}</p>
            <p className="mt-2 text-sm text-on-variant">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 px-4 py-12 md:grid-cols-2 md:px-10">
        <article className="relative overflow-hidden border border-outline bg-surface-lowest p-8">
          <div className="absolute top-0 left-0 h-full w-1 bg-error" />
          <h2 className="text-xl font-semibold text-charcoal">The Problem</h2>
          <p className="mt-3 leading-7 text-on-variant">
            Mental health indicators are split across Statistics Canada and CIHI
            tables, with uneven years, suppressed cells, and different age
            definitions. Without a shared structure it is hard to see provincial
            and demographic differences.
          </p>
        </article>
        <article className="relative overflow-hidden border border-outline bg-surface-lowest p-8">
          <div className="absolute top-0 left-0 h-full w-1 bg-primary" />
          <h2 className="text-xl font-semibold text-charcoal">The Opportunity</h2>
          <p className="mt-3 leading-7 text-on-variant">
            Cleaned, comparable tables can show cycle-to-cycle change, province
            contrasts, and groups with higher reported burden — enough to support
            prevention-resource planning, not individual prediction.
          </p>
        </article>
      </section>
    </div>
  );
}
