# Job Market Analysis Dashboard

Interactive Next.js dashboard for analyzing job-market trends, skills demand, salary ranges, and location patterns using the `lukebarousse/data_jobs` dataset.

## Features

- Real-time dashboard cards and market trend charts.
- Skills and salary visualizations.
- CSV analysis workspace.
- Advanced Filtering (Jobs tab):
  - Job Title filter
  - Country filter
  - Salary Range (Min/Max)
  - Remote-only toggle
  - Detailed result cards with salary, remote status, location, and schedule type

## Frontend Stack

- Next.js (App Router)
- React
- Recharts

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the frontend:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

## Backend Connection

By default, frontend API routes proxy to:

```text
http://127.0.0.1:5000
```

Override with environment variables:

- `BACKEND_API_URL`
- `NEXT_PUBLIC_API_URL`

## API Routes (Frontend Proxy)

- `GET /api/all` -> dashboard aggregate data
- `GET /api/filter` -> advanced filtered job records

Example:

```text
/api/filter?title=data%20analyst&country=united%20states&min_salary=60000&max_salary=180000&remote=true&limit=30
```

## Notes

- If backend is unavailable, frontend routes attempt local file fallback using `backend/precomputed_data.json`.
- For best advanced filtering results, regenerate backend precomputed data using the updated analyzer so `job_records` are included.
