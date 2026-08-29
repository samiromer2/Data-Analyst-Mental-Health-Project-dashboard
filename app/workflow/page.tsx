const steps = [
  {
    n: "01",
    title: "Data collection",
    body: "Canadian Track A tables from Statistics Canada and CIHI. The dashboard does not use the MHACS microdata file or the synthetic Kaggle set.",
  },
  {
    n: "02",
    title: "Data validation",
    body: "Profile row counts, cycles, geographies, missing VALUE cells, and STATUS flags. Filename mismatches are recorded — some catalogue exports are not the table their file name suggests.",
  },
  {
    n: "03",
    title: "Data cleaning",
    body: "Standardize StatCan long-format columns, drop SYMBOL/TERMINATED metadata, keep STATUS, and refuse to impute F or x cells. CIHI chart-definition exports are unpivoted into tidy rows.",
  },
  {
    n: "04",
    title: "Data transformation",
    body: "Normalize geography names, keep Percent as the primary metric, retain counts for context, and apply SCALAR_FACTOR before any comparison.",
  },
  {
    n: "05",
    title: "Exploratory data analysis",
    body: "Ask what each table can support: cycle comparison, province contrast, age/sex breaks. A continuous national trend line is not treated as available.",
  },
  {
    n: "06",
    title: "Visualization",
    body: "Dashboard sections are curated. Data Explorer lets a reader choose axes and read the underlying rows. Charts update from the same API.",
  },
  {
    n: "07",
    title: "Insights",
    body: "Translate the evidence into statements with caveats: COVID collection change, suppression, coverage gaps, and ideation versus mortality.",
  },
];

export const metadata = { title: "Data Workflow" };

export default function WorkflowPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-10 md:px-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-charcoal">Data Workflow</h1>
        <p className="mt-2 text-on-variant">
          How the analysis was done. This is the method story. About the Data on
          the dashboard is the short reference.
        </p>
      </header>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.n} className="relative flex gap-6">
            {index < steps.length - 1 ? (
              <span className="absolute top-12 left-6 h-[calc(100%-0.5rem)] w-px bg-outline-strong" />
            ) : null}
            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-outline bg-surface-lowest font-data text-sm text-on-variant">
              {step.n}
            </div>
            <article className="flex-1 border border-outline bg-surface-lowest p-6">
              <h2 className="text-xl font-semibold text-charcoal">{step.title}</h2>
              <p className="mt-2 leading-7 text-on-variant">{step.body}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
