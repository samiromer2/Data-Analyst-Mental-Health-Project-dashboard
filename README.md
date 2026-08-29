# MindMetrics

Public Next.js site for the Canadian mental-health analytics project. Deploy on Vercel.

Analysis source of truth: [AmanyaPhillip/Data-Analyst-Mental-Health-Project](https://github.com/AmanyaPhillip/Data-Analyst-Mental-Health-Project)

## Pages

- `/` Home
- `/dashboard` curated analytics (Overview, Trends, Demographics, Geographic, Risk, About the Data)
- `/explorer` free-form table and chart explorer
- `/insights` interpreted findings
- `/workflow` methodology

## Run

```bash
npm install
npm run dev
```

Upload cleaned CSVs to `data/processed/` using the contract in that folder. The UI stays empty until files are present.

## Vercel

Root directory is this repo. Include `data/processed/**` in the deployment. After you add CSVs, commit them or attach them in the Vercel project.
