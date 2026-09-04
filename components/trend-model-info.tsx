import Link from "next/link";
import { TREND_MODEL_INFO } from "@/lib/model-info";

export function TrendModelInfo() {
  return (
    <details className="border border-outline bg-surface-dim p-4 text-sm leading-6 text-on-variant [&_summary]:cursor-pointer">
      <summary className="font-medium text-charcoal">About this model</summary>
      <div className="mt-3 flex flex-col gap-3">
        <p>{TREND_MODEL_INFO.summary}</p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-slate">Model</dt>
            <dd className="font-data text-charcoal">{TREND_MODEL_INFO.algorithm}</dd>
          </div>
          <div>
            <dt className="text-slate">Test accuracy</dt>
            <dd className="font-data text-charcoal">
              {(TREND_MODEL_INFO.testAccuracy * 100).toFixed(1)}%
            </dd>
          </div>
          <div>
            <dt className="text-slate">Test macro-F1</dt>
            <dd className="font-data text-charcoal">{TREND_MODEL_INFO.testMacroF1.toFixed(3)}</dd>
          </div>
          <div>
            <dt className="text-slate">Target</dt>
            <dd className="text-charcoal">Up / Down</dd>
          </div>
        </dl>
        <p className="text-xs">{TREND_MODEL_INFO.limitation}</p>
        <p className="text-xs">
          Full methodology on{" "}
          <Link href="/dashboard/about" className="text-primary underline">
            About the Data
          </Link>
          .
        </p>
      </div>
    </details>
  );
}
