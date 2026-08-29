import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-outline bg-surface-container px-4 py-6 md:flex-row md:px-10">
      <p className="text-xl font-semibold text-primary">MindMetrics</p>
      <nav className="flex flex-wrap justify-center gap-4 text-sm text-on-variant">
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
