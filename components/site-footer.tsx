import Link from "next/link";
import { CanadaFlag } from "@/components/canada-flag";

export function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-outline bg-surface-container px-4 py-6 md:flex-row md:px-10">
      <p className="inline-flex items-center text-xl font-semibold text-primary">
        <CanadaFlag className="h-6 w-6 mr-2" /> Wellness Metrics
      </p>
      <nav className="flex flex-wrap justify-center gap-4 text-sm text-on-variant">
        <Link href="/executive-brief" className="hover:text-primary">
          Executive Brief & Insights
        </Link>
        <Link href="/workflow" className="hover:text-primary">
          Data Workflow
        </Link>
        <Link href="/dashboard/about" className="hover:text-primary">
          About the Data
        </Link>
      </nav>
      <p className="text-sm text-on-variant">
        Population-level analysis · Canada · 9-8-8 Suicide Crisis Helpline
      </p>
    </footer>
  );
}
