export interface WorkflowStepDetail {
  id: string;
  n: string;
  title: string;
  phase: string;
  shortDesc: string;
  objective: string;
  keyActivities: string[];
  inputData: string[];
  outputArtifacts: string[];
  tools: string[];
  notebookRef: string;
  reportRef: string;
  visualType:
    | "ingestion"
    | "cleaning"
    | "eda"
    | "kpi"
    | "ml_sandbox"
    | "trend_live"
    | "bi_dashboard";
  metricsOrHighlight: string;
}

export const WORKFLOW_STEPS: WorkflowStepDetail[] = [
  {
    id: "step-01",
    n: "01",
    title: "Data Understanding & Ingestion",
    phase: "Phase 1: Ingestion & Profiling",
    shortDesc:
      "Profile raw Canadian health survey tables, examine multi-year survey cycles, and establish suppression rules.",
    objective:
      "Audit public Statistics Canada (CCHS) and CIHI tables to document data grain, cycles, missingness, and data quality flags prior to processing.",
    keyActivities: [
      "Audited StatCan CCHS tables (13-10-0972, 13-10-0465, 13-10-0802) across 2-year survey cycles (2015–2022).",
      "Catalogued data quality flags: A (excellent), B (very good), C (good), E (use with caution), and F / x (suppressed for confidentiality).",
      "Verified geographic coverage across 10 provinces and 3 territories, identifying territory sampling exclusions.",
      "Established strict data governance: zero imputation for suppressed cells (F/x) to avoid artificial variance.",
    ],
    inputData: [
      "StatCan Table 13-10-0972-01 (Perceived Mental Health)",
      "StatCan Table 13-10-0465-01 (Mental Health Disorders)",
      "StatCan Table 13-10-0802-01 (Stress & Coping)",
      "CIHI Chart Exports (Hospitalizations & ED Visits)",
    ],
    outputArtifacts: [
      "data/raw/ metadata catalogs",
      "docs/data_inventory.md",
      "Report 1: Dataset Review & Governance Protocol",
    ],
    tools: ["Python 3.11", "Pandas", "StatCan API", "Jupyter"],
    notebookRef: "notebooks/01_data_understanding.ipynb",
    reportRef: "Report 1 - Dataset Review and Next Steps.md",
    visualType: "ingestion",
    metricsOrHighlight: "4 Core Public Sources · 10+ Survey Cycles · Strict 'F/x' Suppression Handling",
  },
  {
    id: "step-02",
    n: "02",
    title: "Data Cleaning & Standardization",
    phase: "Phase 2: Cleaning & Tidy Transformation",
    shortDesc:
      "Standardize StatCan long format, clean metadata columns, and unpivot CIHI chart definitions into tidy rows.",
    objective:
      "Transform disparate tabular formats into a unified, tidy schema with validated numeric types and standardized geography labels.",
    keyActivities: [
      "Standardized column naming conventions across all survey sources (REF_DATE → start_year, end_year).",
      "Dropped obsolete metadata columns (SYMBOL, TERMINATED, DECIMALS) while preserving STATUS quality indicators.",
      "Unpivoted CIHI wide visual exports into structured long-format rows for youth hospitalization metrics.",
      "Applied SCALAR_FACTOR adjustments to align percentage rates and population counts uniformly.",
    ],
    inputData: [
      "data/raw/13100972.csv (StatCan raw long-format)",
      "data/raw/13100465.csv (CCHS-MH raw)",
      "data/raw/cihi_youth_mental_health.csv",
    ],
    outputArtifacts: [
      "data/processed/perceived_mh_annual.csv",
      "data/processed/suicidal_thoughts.csv",
      "data/processed/stress_coping.csv",
      "data/processed/cihi_children.csv",
    ],
    tools: ["Pandas", "NumPy", "Regex", "Python ETL Pipeline"],
    notebookRef: "notebooks/02_data_cleaning.ipynb",
    reportRef: "Report 2 - Data_Cleaning_Results.md",
    visualType: "cleaning",
    metricsOrHighlight: "100% Schema Alignment · Zero Data Loss · Tidy Long Format Generated",
  },
  {
    id: "step-03",
    n: "03",
    title: "Exploratory Data Analysis (EDA)",
    phase: "Phase 3: Exploratory & Disparity Analysis",
    shortDesc:
      "Analyze provincial variance, sex disparities (gender paradox), age gradients, and COVID-19 cycle breaks.",
    objective:
      "Investigate patterns, demographic distributions, and temporal inflection points across Canadian provinces and demographics.",
    keyActivities: [
      "Uncovered the Gender Paradox: females report significantly higher rates of fair/poor mental health (8.1% vs 6.8%) and suicidal ideation, yet exhibit higher resilience coping indices.",
      "Analyzed Youth Crisis inflection: identified steep declines in positive mental health among youth aged 15–24 following the 2020 COVID collection break.",
      "Evaluated Provincial disparities: Atlantic provinces and Quebec demonstrated distinct regional trends compared to Prairie and Western provinces.",
      "Quantified socioeconomic gradients showing inverse correlation between household income quintile and mental health vulnerability.",
    ],
    inputData: [
      "data/processed/perceived_mh_annual.csv",
      "data/processed/stress_coping.csv",
      "data/processed/suicidal_thoughts.csv",
    ],
    outputArtifacts: [
      "EDA Distribution Plots & Correlation Matrices",
      "docs/gender_paradox_findings.md",
      "Report 3: EDA and SQL Ingestion",
    ],
    tools: ["Seaborn", "Matplotlib", "Pandas", "StatsModels"],
    notebookRef: "notebooks/03_eda.ipynb",
    reportRef: "Report 3 - EDA and SQL .md",
    visualType: "eda",
    metricsOrHighlight: "Identified Youth Crisis Gap · Gender Paradox Breakdown · Provincial Heatmaps",
  },
  {
    id: "step-04",
    n: "04",
    title: "SQL Analytics & KPI Development",
    phase: "Phase 4: KPI Aggregation & Modeling",
    shortDesc:
      "Execute SQL analytical queries to compute high-level national and provincial KPIs for executive decision support.",
    objective:
      "Design and compute robust, reproducible KPI measures tracking perceived wellness, stress vulnerability, and emergency service demand.",
    keyActivities: [
      "Developed SQL queries with window functions to compute period-over-period delta benchmarks.",
      "Derived 4 core population health KPIs: Excellent/Very Good Perceived MH, Fair/Poor Vulnerability, High Daily Stress, and 12-Month Ideation.",
      "Aggregated provincial rankings and territory rollup exclusions to ensure statistical validity.",
      "Exported standardized summary KPI tables (`04_kpi_summary.csv`) to feed frontend dashboards and Power BI models.",
    ],
    inputData: [
      "data/processed/perceived_mh_annual.csv",
      "data/processed/mh_long.csv",
      "SQLite / In-Memory SQL database",
    ],
    outputArtifacts: [
      "data/processed/04_kpi_summary.csv",
      "data/processed/socioeconomic_gradient.csv",
      "Report 4: SQL Analytics & KPI Progress Report",
    ],
    tools: ["SQLite", "DuckDB / SQL", "Pandas SQL", "DAX Formulas"],
    notebookRef: "notebooks/04_analysis.ipynb",
    reportRef: "Report 4 - SQL Analytics & KPI Development — Progress Report.md",
    visualType: "kpi",
    metricsOrHighlight: "4 Core Population KPIs · Provincial Ranking Tables · Windowed Deltas",
  },
  {
    id: "step-05",
    n: "05",
    title: "Machine Learning Synthetic Sandbox",
    phase: "Phase 5: ML Sandbox & Governance Firewall",
    shortDesc:
      "Experiment with ML predictive algorithms in a strict sandbox environment with zero individual-level prediction.",
    objective:
      "Test classification models (Random Forest, Logistic Regression, XGBoost) on synthetic sandbox data to evaluate feature importance and algorithmic behaviors.",
    keyActivities: [
      "Trained multi-class classification models on synthetic benchmark datasets to explore factor relationships.",
      "Evaluated model performance using ROC-AUC (0.84), precision-recall curves, and feature importance rankings.",
      "Implemented strict ethical boundary rules: model outputs are strictly for population prevention intelligence, never individual scoring or clinical diagnostics.",
      "Established model transparency documentation detailing limitations, bias audits, and fairness criteria.",
    ],
    inputData: [
      "data/synthetic/mental_health_dataset.csv (Kaggle benchmark)",
      "Synthetic feature engineering matrices",
    ],
    outputArtifacts: [
      "Feature Importance Rankings (Work Stress, Sleep, Coping Support)",
      "Model Evaluation Metrics & ROC Curves",
      "Report 5: ML Synthetic Sandbox Progress Report",
    ],
    tools: ["Scikit-Learn", "XGBoost", "Joblib", "SHAP"],
    notebookRef: "notebooks/05_ml_synthetic_sandbox.ipynb",
    reportRef: "Report 5 - ML Synthetic Sandbox — Progress Report.md",
    visualType: "ml_sandbox",
    metricsOrHighlight: "ROC-AUC 0.84 · Strict Ethical Firewall · Feature Importance Analysis",
  },
  {
    id: "step-06",
    n: "06",
    title: "Live StatCan API & Trend Forecasting",
    phase: "Phase 6: Live WDS Feed & Directional Serving",
    shortDesc:
      "Deploy a real-time FastAPI microservice fetching live Statistics Canada vectors and predicting indicator trajectories.",
    objective:
      "Automate data ingestion by connecting to Statistics Canada's Web Data Service API and feeding live vectors into a trained directional trend model.",
    keyActivities: [
      "Built FastAPI microservice (`api_service/main.py`) with CORS middleware and auto-reloading endpoints.",
      "Integrated Statistics Canada WDS REST endpoint (`getDataFromVectorsAndLatestNPeriods`) for real-time vector fetching.",
      "Trained and serialized an scikit-learn trend-direction pipeline (`06_trend_direction_model.joblib`) predicting class probabilities for [increase, decrease, stable].",
      "Implemented live vector lookup indexing 100+ StatCan indicators across Canadian provinces.",
    ],
    inputData: [
      "Statistics Canada WDS REST API (`https://www150.statcan.gc.ca/t1/wds/rest/`)",
      "api_service/models/06_trend_direction_model.joblib",
      "api_service/data/perceived_mh_annual.csv",
    ],
    outputArtifacts: [
      "Live API Endpoints: `/vectors`, `/live/{vector_id}`, `/live-predict/{vector_id}`",
      "data/processed/trend_predictions.csv",
      "Report 6: Live Feed Architecture & Evaluation",
    ],
    tools: ["FastAPI", "Uvicorn", "Requests", "Joblib", "Scikit-Learn", "StatCan WDS"],
    notebookRef: "notebooks/06_trend_direction_model.ipynb",
    reportRef: "Report 6 - livefeed.md",
    visualType: "trend_live",
    metricsOrHighlight: "Real-Time StatCan Vector Fetching · ML Directional Classification · Sub-100ms API",
  },
  {
    id: "step-07",
    n: "07",
    title: "Native Power BI Rebuild & Web Dashboard",
    phase: "Phase 7: Decision Support & Delivery",
    shortDesc:
      "Reconstruct the 4-page Power BI report natively into Next.js/Recharts with interactive choropleths and slide decks.",
    objective:
      "Deliver an intuitive, high-performance web dashboard and executive briefing platform for researchers, analysts, and healthcare policymakers.",
    keyActivities: [
      "Rebuilt the teammate's 4-page Power BI report natively (`/dashboard/report`) using Next.js 16, TypeScript, and Recharts without external iframes.",
      "Engineered an interactive inline-SVG Canada choropleth map with Albers equal-area projection and provincial hover metrics.",
      "Built the interactive Data Explorer (`/explorer`) supporting ad-hoc indicator slicing, multi-year filtering, and CSV table views.",
      "Created an interactive Executive Slide Deck (`/executive-brief`) presenting findings, policy recommendations, and methodology.",
    ],
    inputData: [
      "data/processed/*.csv (All cleaned analytical datasets)",
      "powerpi/Data-Analyst-Mental-Health-Project.pbix (Reference model)",
      "components/report/canada-paths.json (Albers TopoJSON)",
    ],
    outputArtifacts: [
      "App Routes: `/dashboard`, `/dashboard/report`, `/explorer`, `/insights`, `/executive-brief`",
      "Interactive SVG Canada Choropleth & Charts",
      "Production Next.js Web Application",
    ],
    tools: ["Next.js 16", "React 19", "Tailwind CSS v4", "Recharts 3", "TypeScript", "Power BI"],
    notebookRef: "lib/report.ts & components/report/",
    reportRef: "Executive Brief & Full Project Deliverable",
    visualType: "bi_dashboard",
    metricsOrHighlight: "4 Native BI Report Tabs · Custom Albers SVG Map · Interactive Slide Presentation",
  },
];
