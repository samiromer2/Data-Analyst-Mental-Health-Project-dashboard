import { demographics } from "@/lib/report";
import { GroupedBar } from "@/components/report/report-charts";

export const metadata = { title: "Analytics Report — Demographics" };

export default async function DemographicsReportPage() {
  const { ideationVsConsult, moodVsIdeation, incomeGradient } = await demographics();

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-outline bg-surface-lowest p-6">
          <h2 className="text-lg font-semibold text-charcoal">
            Reported suicidal thoughts vs. professional consultation, by sex
          </h2>
          <p className="mb-4 text-sm text-on-variant">
            Women report more suicidal thoughts and much more help-seeking; men&apos;s
            consultation barely exceeds their own ideation rate.
          </p>
          <GroupedBar
            data={ideationVsConsult}
            series={["Reported suicidal thoughts", "Consulted a professional"]}
            xKey="sex"
          />
        </div>

        <div className="border border-outline bg-surface-lowest p-6">
          <h2 className="text-lg font-semibold text-charcoal">
            Mood disorder vs. suicidal thoughts, by sex
          </h2>
          <p className="mb-4 text-sm text-on-variant">
            The &ldquo;gender paradox&rdquo;: higher reported morbidity among women, while
            suicide mortality (not shown here) runs far higher among men.
          </p>
          <GroupedBar
            data={moodVsIdeation}
            series={["Mood disorder", "Suicidal thoughts"]}
            xKey="sex"
          />
        </div>
      </section>

      <section className="border border-outline bg-surface-lowest p-6">
        <h2 className="text-lg font-semibold text-charcoal">
          Socioeconomic gradient: mental health by household income
        </h2>
        <p className="mb-4 text-sm text-on-variant">
          Weighted from the MHACS 2022 microdata. Fair/poor mental health falls sharply
          as income rises; excellent/very-good rises.
        </p>
        <GroupedBar
          data={incomeGradient}
          series={["Fair or poor mental health", "Excellent or very good"]}
          xKey="bracket"
          horizontal
          height={340}
        />
      </section>
    </div>
  );
}
