export interface SlideData {
  id: number;
  category: string;
  badge: string;
  title: string;
  subtitle: string;
  takeaway: string;
  speakerNotes: string;
  type:
    | "title"
    | "architecture"
    | "longitudinal"
    | "cannabis"
    | "youth_mental_health"
    | "income_mental_health"
    | "gender_paradox"
    | "provincial_concordance"
    | "roadmap";
  teamMembers?: string[];
  techStack?: Array<{ label: string; value: string }>;
  datasets?: Array<{ id: string; name: string; desc: string }>;
  disambiguationRows?: Array<{ track: string; metric: string; value: string }>;
  stats?: Array<{
    label: string;
    value: string;
    subtext: string;
    trend?: "up" | "down" | "neutral";
    delta?: string;
    color?: "red" | "blue" | "teal" | "purple" | "amber";
    highlight?: boolean;
  }>;
  chartData1?: Array<Record<string, string | number>>;
  chartData2?: Array<Record<string, string | number>>;
  tableData?: Array<Record<string, string | number | boolean>>;
  bulletPoints?: string[];
  pillars?: Array<{
    title: string;
    description: string;
    action: string;
    bullets?: string[];
    tag: string;
    accent: "red" | "teal" | "blue" | "purple";
  }>;
}

export const PRESENTATION_SLIDES: SlideData[] = [
  // SLIDE 1: TITLE & TEAM INTRO
  {
    id: 1,
    category: "Capstone Presentation",
    badge: "NPower Canada Capstone Project",
    title: "Wellness Metrics Presentation",
    subtitle: "",
    takeaway:
      "By integrating 7 public health datasets across Statistics Canada and CIHI, this investigation resolves critical surveillance disparities and uncovers decisive population health signals.",
    speakerNotes:
      "Welcome evaluators and panel members. Today our team presents our comprehensive Data Analytics Capstone on Canadian Mental Health and Suicide Prevention. Over the past decade, Canada has experienced profound macro shifts in mental wellness. By integrating seven diverse public health datasets across Statistics Canada and CIHI, our team resolved critical data disparities and uncovered crucial findings—including the clinical Gender Paradox, the million-person care deficit, and pediatric triage dynamics—to provide actionable insights for public healthcare decision makers.",
    type: "title",
    teamMembers: [
      "Phillip Amanya",
      "Fatima Hafeez",
      "Danny Liu",
      "Rebal Mallick",
      "Jyothi Hombal",
      "Misa Davari",
      "Samir Omer",
    ],
    techStack: [
      { label: "Longitudinal Scope", value: "2002–2024 Canadian Open Health Data" },
      { label: "Primary Sources", value: "Statistics Canada (CCHS, CSS, MHACS) & CIHI" },
      { label: "Architecture", value: "Python, SQLite Relational Joins, Plotly / Recharts" },
    ],
  },

  // SLIDE 2: PERCEIVED HEALTH OVER THE YEARS
  {
    id: 2,
    category: "Macro Trajectory & Decadal Shifts",
    badge: "20-Year Longitudinal Trend (2002–2023)",
    title: "Perceived Health Over the Years",
    subtitle:
      "Over the past two decades, Canadians reporting fair or poor mental health more than doubled, while excellent ratings experienced a persistent decline.",
    takeaway:
      "Fair/poor self-rated mental health doubled from 6.9% in 2002 to 15.3% in 2023 (+7.5 pp vs 2012), with 1.91 million additional adults entering distress between 2021 and 2023.",
    speakerNotes:
      "This slide tracks the 20-year longitudinal trajectory of perceived mental health across Canada from 2002 to 2023. Self-rated fair or poor mental health doubled from 7.8% in 2012 to 15.3% in 2023. Concurrently, Canadians rating their mental health as very good or excellent fell from 67.1% down to 51.8%. Notice our quarterly tracking: between 2021-Q2 and 2023-Q3 alone, 1.91 million additional Canadian adults migrated into fair or poor health status, showing that post-pandemic distress levels have remained elevated.",
    type: "longitudinal",
    stats: [
      {
        label: "2023 Fair/Poor Rate",
        value: "15.3%",
        subtext: "Self-rated mental health",
        delta: "+7.5 pp vs 2012",
        trend: "up",
        color: "red",
        highlight: true,
      },
      {
        label: "Quarterly Migration",
        value: "+1.91M",
        subtext: "2021-Q2 to 2023-Q3",
        delta: "Adults entering distress",
        trend: "up",
        color: "blue",
      },
      {
        label: "Very Good / Excellent",
        value: "51.8%",
        subtext: "Down from 67.1% (2002)",
        delta: "-15.3 pp decadal decline",
        trend: "down",
        color: "teal",
      },
    ],
    chartData1: [
      { period: "2002", poor: 6.9, good: 67.1 },
      { period: "2012", poor: 7.8, good: 65.1 },
      { period: "2015", poor: 8.4, good: 62.8 },
      { period: "2019", poor: 9.2, good: 60.5 },
      { period: "2021", poor: 12.8, good: 55.4 },
      { period: "2022", poor: 14.7, good: 53.1 },
      { period: "2023", poor: 15.3, good: 51.8 },
    ],
    bulletPoints: [
      "Long-term shift: Fair or poor mental health ratings increased from 6.9% in 2002 to 15.3% in 2023 across nationwide surveys.",
      "Post-pandemic persistence: The sharpest climb happened after 2019 (9.2% to 15.3%), showing elevated distress continued well after lockdowns ended.",
      "Quarterly migration: Over 1.91 million additional adult Canadians entered fair or poor mental health between mid-2021 and late-2023.",
    ],
  },

  // SLIDE 3: CANNABIS USE VS. CLINICAL DEPENDENCE
  {
    id: 3,
    category: "Substance Surveillance & Decoupling",
    badge: "Post-Legalization Trends (2012 vs 2022)",
    title: "Cannabis Use vs. Clinical Dependence",
    subtitle:
      "Following legalization, past-year cannabis use surged by 80%, yet reported clinical abuse and dependence remained statistically flat.",
    takeaway:
      "While 12-month cannabis use jumped 80% post-legalization (12.2% to 22.0%), clinical dependence remained flat (1.3% to 1.4%), demonstrating social adoption without an addiction crisis.",
    speakerNotes:
      "This slide isolates the impact of cannabis legalization by comparing CCHS 2012 baseline data against MHACS 2022 post-legalization microdata. Past-year cannabis use surged by 80% from 12.2% to 22.0%, and lifetime usage rose to 46.1%. However, clinical cannabis abuse and dependence remained virtually flat at 1.4% compared to 1.3% a decade earlier. This decoupling demonstrates that broad legal and commercial access drove social normalization rather than a clinical substance abuse epidemic.",
    type: "cannabis",
    stats: [
      {
        label: "Past-Year Use Surge",
        value: "22.0%",
        subtext: "12-month cannabis use",
        delta: "+80.3% relative (+9.8 pp)",
        trend: "up",
        color: "teal",
        highlight: true,
      },
      {
        label: "Clinical Dependence",
        value: "1.4%",
        subtext: "Substance abuse disorder",
        delta: "+0.1 pp (statistically flat)",
        trend: "neutral",
        color: "blue",
      },
      {
        label: "Lifetime Exposure",
        value: "46.1%",
        subtext: "Ever consumed cannabis",
        delta: "Up from 42.5% in 2012",
        trend: "up",
        color: "purple",
      },
    ],
    chartData1: [
      { indicator: "12-Month Cannabis Use", baseline: 12.2, post: 22.0 },
      { indicator: "Lifetime Cannabis Use", baseline: 42.5, post: 46.1 },
      { indicator: "Clinical Abuse / Dependence", baseline: 1.3, post: 1.4 },
    ],
    bulletPoints: [
      "Substantial adoption: Nearly 1 in 4 Canadians (22.0%) reported past-year cannabis use in 2022, up from 12.2% in 2012.",
      "Clinical decoupling: Severe clinical dependence rates remained essentially unchanged at 1.4%, disproving early fears of an addiction epidemic.",
    ],
  },

  // SLIDE 4: YOUTH MENTAL HEALTH
  {
    id: 4,
    category: "Age Groups & Vulnerability",
    badge: "National Survey Insights by Age (MHACS 2022)",
    title: "Youth Mental Health Challenges",
    subtitle:
      "Young people aged 15 to 24 experience the highest rates of anxiety and depression in Canada, while PTSD peaks later in adulthood.",
    takeaway:
      "1 in 5 young Canadians (ages 15–24) report struggling with anxiety disorders—nearly double the rate of older adults—highlighting the urgent need for early support in schools and communities.",
    speakerNotes:
      "This slide looks at how mental health challenges differ across age groups. Young Canadians aged 15 to 24 report the highest rates of both anxiety (20.2%) and mood challenges like depression (16.1%). As people get older, reported rates of anxiety and depression steadily decline. However, PTSD follows a completely different pattern: it peaks during mid-career adulthood between ages 25 and 64, likely due to years of accumulated workplace and life stress.",
    type: "youth_mental_health",
    stats: [
      {
        label: "Youth Anxiety Rate",
        value: "20.2%",
        subtext: "Ages 15–24 cohort",
        delta: "Highest of any age group",
        trend: "up",
        color: "purple",
        highlight: true,
      },
      {
        label: "Youth Mood Disorders",
        value: "16.1%",
        subtext: "Depression & mood challenges",
        delta: "8× higher than seniors",
        trend: "up",
        color: "blue",
      },
      {
        label: "Mid-Life PTSD Peak",
        value: "4.1%",
        subtext: "Ages 25–44 working adults",
        delta: "Cumulative life stress",
        trend: "up",
        color: "amber",
      },
    ],
    chartData1: [
      { cohort: "Youth (15–24)", anxiety: 20.2, mood: 16.1, ptsd: 2.2 },
      { cohort: "Adults (25–44)", anxiety: 12.6, mood: 11.0, ptsd: 4.1 },
      { cohort: "Middle Age (45–64)", anxiety: 7.8, mood: 6.8, ptsd: 4.0 },
      { cohort: "Seniors (65+)", anxiety: 3.4, mood: 2.1, ptsd: 1.8 },
    ],
    bulletPoints: [
      "Highest burden on youth: Young people aged 15 to 24 face the highest rates of anxiety (20.2%) and mood disorders (16.1%).",
      "Steady decline with age: Anxiety and depression rates steadily drop among older age groups, reaching the lowest levels in seniors (65+).",
      "The PTSD difference: While anxiety drops with age, PTSD peaks among working adults aged 25 to 64 due to cumulative work and life stress.",
    ],
  },

  // SLIDE 5: HOW HOUSEHOLD INCOME IMPACTS MENTAL HEALTH
  {
    id: 5,
    category: "Income & Well-Being",
    badge: "Mental Health by Income Bracket (MHACS 2022)",
    title: "How Household Income Impacts Mental Health",
    subtitle:
      "Canadians in lower-income households are over three times more likely to report fair or poor mental health compared to higher earners.",
    takeaway:
      "Over 20% of Canadians living on less than $20,000 per year report fair or poor mental health, compared to only 5.8% among those earning $80,000 or more.",
    speakerNotes:
      "This slide shows a strong connection between financial security and mental wellness in Canada. Canadians in the lowest income bracket (under $20,000 a year) report fair or poor mental health at a rate of 20.4%. As household income rises, mental health ratings consistently improve, dropping to just 5.8% in households earning over $80,000. This 3.5-fold gap shows that financial stress and lack of affordable care significantly hurt everyday mental well-being.",
    type: "income_mental_health",
    stats: [
      {
        label: "Lowest Income (<$20k)",
        value: "20.4%",
        subtext: "Report fair or poor health",
        delta: "1 in 5 Canadians",
        trend: "up",
        color: "red",
        highlight: true,
      },
      {
        label: "Highest Income ($80k+)",
        value: "5.8%",
        subtext: "Report fair or poor health",
        delta: "3.5× lower risk",
        trend: "down",
        color: "teal",
      },
      {
        label: "The Income Gap",
        value: "3.52×",
        subtext: "Risk multiplier for lowest earners",
        delta: "+14.6 percentage points",
        trend: "up",
        color: "amber",
      },
    ],
    chartData1: [
      { income: "Under $20k", rate: 20.4 },
      { income: "$20k–$40k", rate: 14.8 },
      { income: "$40k–$60k", rate: 10.2 },
      { income: "$60k–$80k", rate: 8.1 },
      { income: "$80k or More", rate: 5.8 },
    ],
    bulletPoints: [
      "Clear income divide: More than 1 in 5 Canadians (20.4%) earning under $20,000 per year report fair or poor mental health.",
      "Step-by-step improvement: Mental health ratings improve at every step up the income ladder, reaching 5.8% for earners over $80,000.",
      "Why it matters: Financial stress, housing costs, and lack of coverage make it harder for lower-income families to access private counseling.",
    ],
  },

  // SLIDE 6: FLAGSHIP DISCOVERY 1 - THE GENDER PARADOX
  {
    id: 6,
    category: "Flagship Relational SQL Join #1",
    badge: "Surveillance Disparity Matrix",
    title: "The Gender Paradox: Self-Reported Distress vs. Mortality",
    subtitle:
      "Cross-joining CCHS clinical diagnoses with CIHI mortality data exposes a 4.64× higher lethality-to-diagnosis ratio in Canadian men.",
    takeaway:
      "Women report 1.5× more mood disorders and 1.8× higher service use, yet Canadian men die by suicide at 3.06× the female rate (16.5 vs 5.4 per 100k)—demonstrating that passive clinical surveys fail to detect acute male risk.",
    speakerNotes:
      "This slide presents our first major flagship discovery: The Gender Paradox. By executing an advanced relational join between CCHS self-reported diagnoses and CIHI suicide mortality rates, we revealed a profound public health contradiction. Women report 1.5 times more diagnosed mood disorders (10.2% vs 6.7%) and higher suicidal thoughts. Yet, Canadian men die by suicide at over 3 times the rate of women—16.5 deaths per 100k versus 5.4. This translates to a 4.64-fold higher lethality-to-diagnosis ratio for men, proving that traditional diagnostic questionnaires fundamentally fail to capture acute male psychological distress.",
    type: "gender_paradox",
    chartData1: [
      { metric: "Diagnosed Mood (%)", men: 6.7, women: 10.2 },
      { metric: "Diagnosed Anxiety (%)", men: 7.2, women: 13.1 },
      { metric: "Professional Consult (%)", men: 12.0, women: 21.4 },
      { metric: "Suicide Deaths (per 100k)", men: 16.5, women: 5.4 },
    ],
    tableData: [
      {
        metric: "12-Month Mood Disorders (%)",
        men: "6.7%",
        women: "10.2%",
        disparity: "1.52× Higher in Women",
        alert: false,
      },
      {
        metric: "Generalized Anxiety (%)",
        men: "7.2%",
        women: "13.1%",
        disparity: "1.82× Higher in Women",
        alert: false,
      },
      {
        metric: "Mental Health Service Use (%)",
        men: "12.0%",
        women: "21.4%",
        disparity: "1.78× Higher in Women",
        alert: false,
      },
      {
        metric: "Suicide Mortality (per 100k)",
        men: "16.5",
        women: "5.4",
        disparity: "3.06× Higher in Men",
        alert: true,
      },
      {
        metric: "Lethality-to-Diagnosis Ratio",
        men: "2.46",
        women: "0.53",
        disparity: "4.64× Higher Male Ratio",
        alert: true,
      },
    ],
  },

  // SLIDE 7: GEOGRAPHIC DISPARITIES & MACRO CONCORDANCE
  {
    id: 7,
    category: "Geographic Disparities & Macro Concordance",
    badge: "Provincial Concordance Matrix",
    title: "Provincial Concordance: Coping Deficits vs. Mood Disorders",
    subtitle:
      "Nova Scotia and Alberta lead Canada in both daily distress and clinical diagnoses, while Quebec's lower rate reflects distinct provincial survey collection methods.",
    takeaway:
      "Provincial mental health distress varies by 2.4× across Canada (22.4% in NS vs. 9.3% in QC). Daily life coping challenges closely mirror hospital diagnosis rates, while Quebec's high resilience score is shaped by differing provincial survey and data collection methods.",
    speakerNotes:
      "This slide analyzes provincial disparities across Canada. We observe a strong relationship between everyday life coping deficits and formal clinical mood disorder diagnoses. Nova Scotia (22.4%) and Alberta (17.4%) report the highest distress burdens in the country. Ontario represents the largest raw patient volume with nearly 11 million people. Meanwhile, Quebec reports the lowest distress rate at 9.3%. It is essential to note that Quebec uses different health survey sampling methods, response framing, and administrative reporting structures, which heavily influences its reported resilience numbers.",
    type: "provincial_concordance",
    chartData1: [
      { province: "Nova Scotia", rate: 22.4, color: "#d32f2f" },
      { province: "N.W.T.", rate: 18.1, color: "#f97316" },
      { province: "Alberta", rate: 17.4, color: "#f97316" },
      { province: "Ontario", rate: 17.3, color: "#1d68bd" },
      { province: "British Columbia", rate: 16.8, color: "#1d68bd" },
      { province: "Saskatchewan", rate: 15.6, color: "#1d68bd" },
      { province: "Manitoba", rate: 13.9, color: "#1d68bd" },
      { province: "Newfoundland", rate: 11.2, color: "#1d68bd" },
      { province: "Quebec", rate: 9.3, color: "#00897b" },
    ],
    tableData: [
      {
        province: "Nova Scotia",
        fairPoor: "22.4%",
        copingDeficit: "20.3%",
        rank: "#1 Highest Burden",
        type: "high",
      },
      {
        province: "Alberta",
        fairPoor: "17.4%",
        copingDeficit: "19.4%",
        rank: "#2 Highest Burden",
        type: "high",
      },
      {
        province: "British Columbia",
        fairPoor: "16.8%",
        copingDeficit: "18.1%",
        rank: "Substance & Drug Burden",
        type: "neutral",
      },
      {
        province: "Ontario",
        fairPoor: "17.3%",
        copingDeficit: "17.9%",
        rank: "Highest Volume (10.9M)",
        type: "neutral",
      },
      {
        province: "Quebec",
        fairPoor: "9.3%",
        copingDeficit: "8.8%",
        rank: "#1 Lowest (Survey Differences)",
        type: "low",
      },
    ],
  },

  // SLIDE 8: STRATEGIC RECOMMENDATIONS & POLICY ROADMAP
  {
    id: 8,
    category: "Strategic Public Health Interventions",
    badge: "Evidence-Grounded Policy Roadmap",
    title: "Actionable Policy Roadmap",
    subtitle:
      "Translating data science breakthroughs into targeted healthcare interventions, suicide prevention funding, and executive monitoring tools.",
    takeaway:
      "Target high-leverage domains: low-barrier male crisis entry points, school- and campus-based youth anxiety hubs (ages 15–24), and socioeconomic therapy subsidies for households under $40k.",
    speakerNotes:
      "In our concluding slide, we synthesize our empirical findings into three strategic public health recommendations and present our interactive dashboard architecture. First, we must fund low-barrier male crisis intervention points to close the 4.6-fold lethality gap. Second, we recommend school- and community-based youth anxiety hubs to support the 1 in 5 young Canadians experiencing anxiety before distress escalates. Third, we propose targeted socioeconomic therapy subsidies in high-distress provinces like Nova Scotia and Alberta. Our accompanying automated interactive dashboard provides continuous KPI tracking for provincial healthcare leaders. Thank you, and we look forward to your questions.",
    type: "roadmap",
    pillars: [
      {
        title: "1. Male Crisis Entry Points",
        description:
          "Overcome the 4.64× lethality paradox by shifting from passive surveys toward proactive community touchpoints:",
        action: "Deploy workplace, sports, and trades-integrated crisis interventions.",
        bullets: [
          "Deploy workplace, sports, and trades-integrated crisis interventions.",
          "Eliminate clinical gatekeeping and destigmatize anonymous male help-seeking.",
          "Close the 39,800 unassisted male care deficit.",
        ],
        tag: "4.64× Lethality Gap",
        accent: "red",
      },
      {
        title: "2. Youth Anxiety & Early Campus Support",
        description:
          "Address the peak 20.2% youth anxiety rate (ages 15–24) through accessible community and educational interventions:",
        action: "Provide free, confidential walk-in counseling and digital navigation in schools and youth hubs.",
        bullets: [
          "Embed free, confidential mental health counselors across high schools and post-secondary campuses.",
          "Deploy fast-access digital and peer-support networks tailored for adolescents and young adults.",
          "Provide early anxiety management and resilience training before symptoms escalate to severe distress.",
        ],
        tag: "20.2% Youth Anxiety Peak",
        accent: "purple",
      },
      {
        title: "3. Economic & Regional Targeting",
        description:
          "Address the 3.52× socioeconomic gradient and regional distress hotspots:",
        action: "Provide targeted psychotherapy subsidies for households earning <$40k.",
        bullets: [
          "Provide targeted psychotherapy subsidies for households earning <$40k.",
          "Direct federal mental health transfers toward high-distress provinces (Nova Scotia and Alberta).",
          "Deploy dedicated mobile crisis infrastructure to Northern territories.",
        ],
        tag: "3.52× Income Gradient",
        accent: "blue",
      },
    ],
  },
];

