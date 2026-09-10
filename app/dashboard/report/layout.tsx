import { ReportTabs } from "@/components/report/report-ui";
import { DataNotice } from "@/components/data-notice";

export const dynamic = "force-dynamic";

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">Analytics Report</h1>
        <p className="mt-2 max-w-3xl text-on-variant">
          A native rebuild of the team&apos;s Power BI report — four views over the
          cleaned Statistics Canada and CIHI data. No Power BI, embed, or external
          service: every figure is computed in-app from the processed CSVs.
        </p>
      </header>
      <ReportTabs />
      <DataNotice>
        Population-level estimates, associational only — not individual prediction.
        Suppressed cells are shown as missing, never zero. Cross-cycle changes span
        the COVID-19 window and CCHS collection changes. If suicide-related content
        is distressing, call or text 9-8-8 in Canada.
      </DataNotice>
      {children}
    </div>
  );
}
