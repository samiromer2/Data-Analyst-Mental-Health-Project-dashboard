export interface SlideData {
  id: number;
  category: string;
  badge: string;
  title: string;
  subtitle: string;
  takeaway: string;
  speakerNotes: string;
  type: "hero" | "metrics" | "trajectory" | "geography" | "demographics" | "predictive" | "recommendations" | "governance";
  stats?: Array<{
    label: string;
    value: string;
    subtext: string;
    trend?: "up" | "down" | "neutral";
    highlight?: boolean;
  }>;
  chartData?: Array<{
    name: string;
    value1?: number;
    value2?: number;
    label?: string;
  }>;
  bulletPoints?: string[];
  pillars?: Array<{
    title: string;
    description: string;
    action: string;
    tag: string;
  }>;
}

export const PRESENTATION_SLIDES: SlideData[] = [
  {
    id: 1,
    category: "Executive Briefing",
    badge: "National Overview · 2002–2024",
    title: "🇨🇦 Wellness Metrics: National Mental Health Briefing",
    subtitle: "A two-decade population-level analysis of mental health trajectories, provincial disparities, and forward-looking resource allocation signals across Canada.",
    takeaway: "Aggregated evidence from Statistics Canada and CIHI highlights systemic shifts requiring targeted prevention investments rather than uniform federal delivery.",
    speakerNotes: "Welcome stakeholders and executives. This briefing synthesizes 20+ years of Canadian Community Health Survey (CCHS) data and CIHI hospital indicators. Key focus: identifying where population distress has outpaced coping capacity and providing forward-looking signals for public health intervention.",
    type: "hero",
    stats: [
      { label: "Population Scope", value: "13", subtext: "Provinces & Territories" },
      { label: "Longitudinal Span", value: "20+", subtext: "Years of Survey Cycles" },
      { label: "Core Evidence Base", value: "8", subtext: "Validated StatCan & CIHI Tables" },
    ],
    bulletPoints: [
      "Synthesizes CCHS mental health cycles (2002, 2012, 2022) with annual reporting up to 2024.",
      "Distinguishes population-level well-being from individual diagnostic clinical models.",
      "Provides predictive machine learning trajectory signals for forward planning.",
    ],
  },
  {
    id: 2,
    category: "Macro Signals",
    badge: "High-Level Findings",
    title: "Executive Summary: Three Core Structural Shifts",
    subtitle: "Over the past 20 years, perceived mental health in Canada has experienced steady erosion, marked by sharp demographic divides and escalating demand for acute crisis services.",
    takeaway: "Self-rated mental health distress has more than doubled nationwide, with the heaviest psychological burden falling on youth and specific regional clusters.",
    speakerNotes: "Point out the divergence between high wellness and distress: high wellness declined by 14 percentage points while fair/poor doubled. Stress that these are self-reported population rates, representing millions of additional Canadians experiencing mental health challenges.",
    type: "metrics",
    stats: [
      {
        label: "Fair or Poor Mental Health",
        value: "15.3%",
        subtext: "Up from 6.9% in 2002 (more than doubled)",
        trend: "up",
        highlight: true,
      },
      {
        label: "Very Good or Excellent",
        value: "53.1%",
        subtext: "Down from 67.1% in 2002 (-14.0% shift)",
        trend: "down",
      },
      {
        label: "Youth Suicidal Ideation",
        value: "17.4%",
        subtext: "Ages 18–34 (2.5× higher than seniors 65+)",
        trend: "up",
        highlight: true,
      },
      {
        label: "High Daily Coping Ability",
        value: "68.2%",
        subtext: "Down 6.4 percentage points over recent cycles",
        trend: "down",
      },
    ],
    bulletPoints: [
      "Distress Doubling: Fair or poor perceived mental health **rose from 6.9% in 2002 to 15.3% in 2022**.",
      "Erosion of Protective Factors: Canadians reporting 'excellent' day-to-day coping has steadily fallen.",
      "Youth Concentration: Young adults are reporting distress and suicidal ideation at rates unprecedented in previous cycles.",
    ],
  },
  {
    id: 3,
    category: "Historical Trends",
    badge: "20-Year Trajectory",
    title: "The 20-Year Trajectory: Steady Erosion of Positive Wellness",
    subtitle: "Comparing landmark CCHS mental health cycles (2002, 2012, 2022) reveals that recent declines are part of a continuous structural trend rather than a transient anomaly.",
    takeaway: "The steady 20-year decline accelerated during 2019–2022, showing that pandemic stressors impacted an already vulnerable baseline.",
    speakerNotes: "Highlight to decision-makers that while COVID-19 accelerated distress, the erosion was already well underway by 2012 (when fair/poor had climbed to 9.2%). This proves systemic pressures (economic, housing, digital connectivity) require multi-year structural support.",
    type: "trajectory",
    chartData: [
      { name: "2002 Cycle", value1: 67.1, value2: 6.9, label: "2002" },
      { name: "2012 Cycle", value1: 61.8, value2: 9.2, label: "2012" },
      { name: "2019/20 CCHS", value1: 58.4, value2: 12.1, label: "2020" },
      { name: "2022 Cycle", value1: 53.1, value2: 15.3, label: "2022" },
      { name: "2023/24 Est.", value1: 50.3, value2: 16.4, label: "2024" },
    ],
    bulletPoints: [
      "Green Series: Very Good or Excellent Mental Health (**fell from 67.1% to 53.1%**).",
      "Red Series: Fair or Poor Mental Health (**rose from 6.9% in 2002 to 15.3% in 2022**).",
      "Noticeable acceleration occurred between 2019 and 2022, compounding existing pressures.",
    ],
  },
  {
    id: 4,
    category: "Geographic Analysis",
    badge: "Provincial Disparities",
    title: "The Geographic Divide: Provincial & Territorial Disparities",
    subtitle: "Mental health outcomes vary widely by geography, with an 11+ percentage point gap in perceived distress between the lowest and highest reporting jurisdictions.",
    takeaway: "Uniform federal mental health spending does not match the geographic reality: Atlantic provinces and northern territories face acute resource deficits.",
    speakerNotes: "Draw attention to Quebec's relative resilience (8.8% fair/poor, 63.6% high wellness) compared to Nova Scotia (19.7% fair/poor). Note that smaller jurisdictions and territories often suffer from survey suppression, requiring special attention to avoid under-resourcing.",
    type: "geography",
    chartData: [
      { name: "Quebec", value1: 63.6, value2: 8.8 },
      { name: "NFLD & Labrador", value1: 53.5, value2: 14.1 },
      { name: "Alberta", value1: 52.4, value2: 15.1 },
      { name: "Manitoba", value1: 51.6, value2: 15.6 },
      { name: "Ontario", value1: 51.3, value2: 15.7 },
      { name: "Saskatchewan", value1: 50.3, value2: 15.9 },
      { name: "British Columbia", value1: 49.1, value2: 16.2 },
      { name: "Nova Scotia", value1: 47.8, value2: 19.7 },
      { name: "Nunavut", value1: 42.6, value2: 21.3 },
    ],
    bulletPoints: [
      "Resilience in Quebec: Consistently highest self-rated wellness (63.6%) and lowest fair/poor rate (8.8%).",
      "Elevated Distress in Atlantic Canada: Nova Scotia reports fair/poor rates exceeding 19.7%.",
      "Territorial Suppressions: Sparse northern populations experience high vulnerability, yet data cells are often suppressed under standard CV thresholds.",
    ],
  },
  {
    id: 5,
    category: "Demographics & Age",
    badge: "Vulnerable Cohorts",
    title: "Generational Cleavage: Youth vs. Older Demographics",
    subtitle: "Across CCHS and CIHI tables, risk indicators display a stark inverse correlation with age: younger Canadians report the highest psychological distress and suicidal ideation.",
    takeaway: "Mental health distress is heavily skewed toward youth aged 18–34. Policy investments must pivot heavily toward early career and educational transitions.",
    speakerNotes: "Highlight the youth ideation stat: 17.4% in 18–34 year-olds is almost 2.5 times higher than the 7.0% reported by seniors 65+. Youth are also reporting significantly lower ability to cope with daily life demands.",
    type: "demographics",
    chartData: [
      { name: "Ages 18–34", value1: 17.4, value2: 44.8, label: "Youth" },
      { name: "Ages 35–49", value1: 13.8, value2: 52.1, label: "Mid-Adults" },
      { name: "Ages 50–64", value1: 10.2, value2: 59.4, label: "Older Adults" },
      { name: "Ages 65+", value1: 7.0, value2: 68.9, label: "Seniors" },
    ],
    bulletPoints: [
      "Suicidal Ideation: 17.4% among young adults (18–34), dropping steadily to 7.0% among seniors (65+).",
      "Daily Demands Handling: Only 44.8% of youth report 'excellent/very good' coping ability, versus nearly 69% among older cohorts.",
      "Service Bottlenecks: CIHI tables confirm that emergency visits for youth mental health have experienced sharp increases over recent years.",
    ],
  },
  {
    id: 6,
    category: "Predictive Intelligence",
    badge: "Machine Learning Signals",
    title: "Predictive Intelligence: Forward-Looking Signals",
    subtitle: "Applying linear trend regression models and time-series extrapolation across CCHS annual cycles provides estimated trajectories for upcoming survey cycles.",
    takeaway: "The predictive model projects sustained downward pressure on positive mental health with 90% confidence unless proactive structural interventions occur.",
    speakerNotes: "Explain the predictive model in this dashboard: it is a population-level direction signal, not an individual clinical prognosis. A 90% probability of 'Down' for positive wellness underscores the necessity of proactive budget and staffing allocations.",
    type: "predictive",
    stats: [
      { label: "Forward Trend Direction", value: "DOWN", subtext: "Projected for next CCHS cycle", highlight: true },
      { label: "Model Confidence", value: "90%", subtext: "High probability trend signal" },
      { label: "Annual Slope Rate", value: "-1.35%", subtext: "Year-over-year wellness trajectory" },
      { label: "Predicted Cycle Value", value: "48.9%", subtext: "Projected national high-wellness baseline" },
    ],
    bulletPoints: [
      "Leading Indicator Signal: Population trends lag by 18–24 months due to survey collection timelines; ML models help bridge this operational delay.",
      "Downward Trajectory: Linear trend analysis confirms a sustained negative slope across all non-Quebec provincial series.",
      "Actionable Target: Halting this downward momentum requires interventions that protect high-wellness populations before they shift into fair/poor categories.",
    ],
  },
  {
    id: 7,
    category: "Policy Recommendations",
    badge: "Actionable Roadmap",
    title: "Strategic Recommendations for Health Leaders",
    subtitle: "Evidence-grounded resource allocation strategies designed to maximize return on public mental health investments.",
    takeaway: "Focus resources on three high-leverage domains: regional transfer equity, youth transition supports, and crisis line community capacity.",
    speakerNotes: "These recommendations translate data into policy decisions. Emphasize that funding should follow the data: adjusting regional formulas, expanding school-to-workplace mental health pipelines, and integrating 9-8-8 helpline capacity.",
    type: "recommendations",
    pillars: [
      {
        title: "1. Weighted Regional Allocations",
        description: "Rebalance mental health funding formulas from pure per-capita allocations to weighted models reflecting provincial distress rates and northern service delivery costs.",
        action: "Target Atlantic and Northern healthcare transfer supplements.",
        tag: "Geographic Equity",
      },
      {
        title: "2. Youth Mental Health Interventions",
        description: "Deploy community-embedded mental health programs targeting youth aged 18–34, focusing on life transition stress, student loans, and employment instability.",
        action: "Expand campus and community peer-support frameworks.",
        tag: "Youth Focus",
      },
      {
        title: "3. 9-8-8 Helpline & Community Capacity",
        description: "Scale crisis response infrastructure while directly funding community follow-up programs to ensure individuals in acute crisis receive sustained outpatient care.",
        action: "Bridge immediate helpline calls to permanent clinical resources.",
        tag: "Crisis Infrastructure",
      },
    ],
  },
  {
    id: 8,
    category: "Governance & Action",
    badge: "Data Integrity & Access",
    title: "Data Integrity, Governance & Interactive Exploration",
    subtitle: "All findings in this briefing are grounded in open Canadian public health records, adhering to strict confidentiality and statistical reliability standards.",
    takeaway: "Stakeholders can dive deeper into the raw tables, custom filters, and trend charts using the interactive tools on 🇨🇦 Wellness Metrics.",
    speakerNotes: "Conclude the presentation by encouraging stakeholders to explore the full interactive dashboard. Remind them of confidentiality and suppression rules: low-count cells are suppressed by StatCan to protect privacy.",
    type: "governance",
    bulletPoints: [
      "Strict Suppression Standards: Data cells with high sampling variability (CV > 35%) are strictly suppressed in compliance with Statistics Canada policies.",
      "Dual Data Foundations: Bridges community population surveys (CCHS) with acute care hospitalizations (CIHI).",
      "Open Data Transparency: The entire data processing methodology and SQL/Python pipelines are documented under Data Workflow.",
    ],
    stats: [
      { label: "Interactive Dashboard", value: "/dashboard", subtext: "Curated metrics and filters" },
      { label: "Data Explorer", value: "/explorer", subtext: "Query custom indicators" },
      { label: "Full Pipeline", value: "/workflow", subtext: "ETL & analytical methodology" },
    ],
  },
];
