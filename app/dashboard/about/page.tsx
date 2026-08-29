import { DataNotice } from "@/components/data-notice";
import { datasetPresence } from "@/lib/store";
import { DATASET_REGISTRY } from "@/lib/datasets";

export const metadata = { title: "About the Data" };

export default async function AboutDataPage() {
  const { present, missing } = await datasetPresence();

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold text-charcoal">About the Data</h1>
        <p className="mt-2 text-on-variant">
          Short reference for sources, definitions, and limits. The full method
          lives on Data Workflow.
        </p>
      </header>
      <DataNotice>
        Analysis stays at the population level. We do not impute suppressed
        cells and we do not treat suicidal thoughts as suicide deaths.
      </DataNotice>

      <section>
        <h2 className="text-xl font-semibold text-charcoal">Sources</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-on-variant">
          <li>Statistics Canada 13-10-0972 — perceived mental health (CCHS)</li>
          <li>Statistics Canada 13-10-0465 — suicidal thoughts and related indicators</li>
          <li>Statistics Canada 13-10-0802 — stress and coping</li>
          <li>CIHI / PHAC Health Infobase — mental-health services</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-charcoal">Expected files</h2>
        <div className="mt-3 overflow-x-auto border border-outline">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-dim text-slate">
              <tr>
                <th className="px-3 py-2 font-medium">File</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {DATASET_REGISTRY.map((item) => (
                <tr key={item.id} className="border-t border-outline">
                  <td className="px-3 py-2 font-data text-charcoal">{item.file}</td>
                  <td className="px-3 py-2 text-on-variant">{item.label}</td>
                  <td className="px-3 py-2">
                    {present.includes(item.file) ? "Loaded" : "Waiting"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {missing.length ? (
          <p className="mt-3 text-sm text-slate">
            Upload missing files into <code>data/processed/</code>.
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-charcoal">Limitations</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-on-variant">
          <li>Most tables have two or three far-apart cycles, not a continuous series.</li>
          <li>Perceived mental health is 18+ only. Age lives on other tables.</li>
          <li>CCHS excludes reserves, institutions, and full-time military.</li>
          <li>Status F and x cells are dropped, never filled.</li>
          <li>MHACS microdata and the synthetic Kaggle set are out of this dashboard.</li>
        </ul>
      </section>
    </div>
  );
}
