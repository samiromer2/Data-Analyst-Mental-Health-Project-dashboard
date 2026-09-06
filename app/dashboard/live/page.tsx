import { DataNotice } from "@/components/data-notice";
import { LivePredictor } from "@/components/live-predictor";

export const metadata = { title: "Live Feed" };
export const dynamic = "force-dynamic";

async function getVectors() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/live-vectors`, { cache: "no-store" });
    const data = await res.json();
    return data.vectors ?? [];
  } catch {
    return [];
  }
}

export default async function LivePage() {
  const vectors = await getVectors();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Live Feed (experimental)</h1>
        <p className="mt-2 text-on-variant">
          Pulls a value directly from Statistics Canada&apos;s Web Data Service
          for the perceived-mental-health table, then feeds it into the
          trend-direction model to predict whether the next cycle rises or
          falls.
        </p>
      </header>
      <DataNotice>
        Experimental. The filters above apply to the curated dashboard, not
        this page. This calls StatCan directly and a local model service —
        both can be slower or unavailable outside a live session.
      </DataNotice>
      <section className="border border-outline bg-surface-lowest p-6">
        <LivePredictor vectors={vectors} />
      </section>
    </div>
  );
}
