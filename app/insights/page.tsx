import { BreakdownChart, TrendChart } from "@/components/charts/analytics-charts";
import { DataNotice } from "@/components/data-notice";
import { parseFilters } from "@/lib/filters";
import type { PageSearchParams } from "@/lib/params";
import { getInsights } from "@/lib/query";
import type { BreakdownPoint, SeriesPoint } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Insights" };

function isSeries(points: SeriesPoint[] | BreakdownPoint[]): points is SeriesPoint[] {
  return points.length > 0 && "period" in points[0];
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const filters = parseFilters(await searchParams);
  const insights = await getInsights(filters);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-10">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Insights</h1>
        <p className="mt-2 text-on-variant">
          So what? Each block states a finding, shows the evidence, and says
          what it does not mean.
        </p>
      </header>
      <DataNotice>
        Language stays associational. These are population-level patterns for
        prevention planning. If suicide-related content is distressing, call or
        text 9-8-8 in Canada.
      </DataNotice>
      {insights.map((item) => (
        <article key={item.id} className="border border-outline bg-surface-lowest p-6">
          <h2 className="text-xl font-semibold text-charcoal">{item.title}</h2>
          <p className="mt-3 text-lg leading-7 text-charcoal">{item.statement}</p>
          {item.points.length > 0 ? (
            <div className="mt-6">
              {isSeries(item.points) ? (
                <TrendChart points={item.points} title="Evidence" />
              ) : (
                <BreakdownChart
                  points={item.points}
                  title="Evidence"
                  layout={item.id === "regional" ? "horizontal" : "vertical"}
                />
              )}
            </div>
          ) : null}
          <div className="mt-6 border-t border-outline pt-4">
            <p className="text-sm font-medium text-primary">What this means</p>
            <p className="mt-2 text-sm leading-6 text-on-variant">{item.meaning}</p>
            <p className="mt-2 text-sm leading-6 text-slate">{item.caveat}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
