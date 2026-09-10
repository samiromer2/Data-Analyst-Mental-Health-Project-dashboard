import Link from "next/link";
import { CanadaFlag } from "@/components/canada-flag";

export function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-outline bg-surface-container px-4 py-6 md:flex-row md:px-10">
<<<<<<< HEAD
      <div className="flex items-center gap-2 text-xl font-semibold text-primary">
        <CanadaFlag className="h-5 w-auto" />
        <span>wellnessMetric</span>
      </div>
=======
      <p className="inline-flex items-center text-xl font-semibold text-primary">
        <CanadaFlag className="inline-block h-5 w-7 rounded-xs align-middle mr-2" /> Wellness Metrics
      </p>
>>>>>>> 84727103cf843827e46cb85b62e7f01138aa89d4
      <nav className="flex flex-wrap justify-center gap-4 text-sm text-on-variant">
        <Link href="/executive-brief" className="hover:text-primary">
          Executive Brief
        </Link>
        <Link href="/workflow" className="hover:text-primary">
          Data Workflow
        </Link>
        <Link href="/dashboard/about" className="hover:text-primary">
          About the Data
        </Link>
        <Link href="/insights" className="hover:text-primary">
          Insights
        </Link>
      </nav>
      <p className="text-sm text-on-variant">
        Population-level analysis · Canada · 9-8-8 Suicide Crisis Helpline
      </p>
    </footer>
  );
}
