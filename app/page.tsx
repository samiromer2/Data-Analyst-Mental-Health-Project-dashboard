import Link from "next/link";
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
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            MindMetrics
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
              href="/dashboard"
              className="bg-primary px-6 py-3 text-center text-sm font-medium text-on-primary hover:bg-primary-container"
            >
              Explore Dashboard
            </Link>
            <Link
              href="/insights"
              className="border border-primary px-6 py-3 text-center text-sm font-medium text-primary hover:bg-surface-dim"
            >
              View Insights
            </Link>
          </div>
        </div>
        <div className="border border-outline bg-surface-lowest p-8 lg:col-span-7">
          <p className="text-sm uppercase tracking-wide text-slate">Project frame</p>
          <p className="mt-3 text-2xl font-semibold text-charcoal">
            Where is the mental-health burden higher, and where might prevention
            resources be needed?
          </p>
          <p className="mt-4 leading-7 text-on-variant">
            This site uses aggregated Canadian statistics. It does not predict
            individual risk and it does not report a suicide mortality rate.
          </p>
          {headline?.available ? (
            <div className="mt-6 border-t border-outline pt-4">
              <p className="text-sm uppercase tracking-wide text-slate">One finding</p>
              <p className="mt-2 leading-7 text-charcoal">{headline.statement}</p>
              <Link href="/insights" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
                What this means
              </Link>
            </div>
          ) : null}
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

      <section className="grid gap-6 border-b border-outline px-4 py-12 md:grid-cols-2 md:px-10">
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

      <section className="px-4 py-12 md:px-10">
        <h2 className="text-2xl font-bold text-charcoal">Project Impact</h2>
        <p className="mt-2 max-w-2xl text-on-variant">
          A public analytics site that keeps the story, the evidence, and the
          method in separate places.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/dashboard" className="border border-outline bg-surface-lowest p-6 hover:border-primary">
            <p className="text-sm text-primary">Dashboard</p>
            <p className="mt-2 font-semibold text-charcoal">What is happening</p>
          </Link>
          <Link href="/explorer" className="border border-outline bg-surface-lowest p-6 hover:border-primary">
            <p className="text-sm text-primary">Data Explorer</p>
            <p className="mt-2 font-semibold text-charcoal">Investigate the tables</p>
          </Link>
          <Link href="/workflow" className="border border-outline bg-surface-lowest p-6 hover:border-primary">
            <p className="text-sm text-primary">Data Workflow</p>
            <p className="mt-2 font-semibold text-charcoal">How the analysis was done</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
