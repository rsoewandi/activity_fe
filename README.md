# Frontend Base

Next.js 15 (App Router) + Tailwind v4 dashboard. Browser hits proxy routes under `/app/api/*` (Next Route Handlers) which forward to the backend at `NEXT_PUBLIC_API_BASE_URL`.

## Structure

```
app/
  layout.js
  page.js
  globals.css
  api/
    activities/          # proxy → backend /api/activities
    dashboard/           # proxy → backend /api/dashboard
components/
  Dashboard.jsx          # top-level dashboard view
  KpiCard.jsx
  TrendChart.jsx
  FeatureBreakdown.jsx
```

## Quick start

```powershell
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev                  # http://localhost:3000
```

## Add a new resource

1. Duplicate `app/api/activities/` → `app/api/<name>/` and rename references.
2. Consume from a client component with `fetch("/api/<name>")`.
