import Link from "next/link";
import { PresentationDeck } from "@/components/slide-deck/presentation-deck";

export const metadata = {
  title: "Executive Brief",
  description:
    "Curated presentation slide deck summarizing two decades of population mental health analytics across Canada.",
};

export default function ExecutiveBriefPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 md:px-10">
      {/* Page Header */}
      <header className="border-b border-outline pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-block border border-outline bg-surface-lowest px-3 py-1 text-xs font-medium text-slate">
              Population-Level Briefing · Canada
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
              Executive Brief
            </h1>
            <p className="mt-2 max-w-3xl text-base text-on-variant">
              A curated findings slide deck synthesizing twenty years of Canadian
              mental health data. Designed for health authorities, decision-makers,
              and policy researchers. Use the on-screen arrows, keyboard shortcuts
              (← / →), or enter fullscreen mode for presentation delivery.
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
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary-container"
            >
              <span>Read Full Insights</span>
            </Link>
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

      {/* Briefing Citation & Exploration Footer Card */}
      <section className="flex flex-col items-start justify-between gap-6 border border-outline bg-surface-container p-8 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-charcoal">
            Looking for granular data tables and custom charts?
          </h3>
          <p className="mt-1 text-sm text-on-variant">
            Use the interactive Data Explorer to filter by age, gender, province,
            and survey year, or inspect the statistical workflow.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/explorer"
            className="border border-outline bg-surface-lowest px-4 py-2 text-sm font-medium text-charcoal hover:border-primary hover:text-primary"
          >
            Open Data Explorer
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
