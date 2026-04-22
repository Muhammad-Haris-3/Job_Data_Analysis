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

## Database Connection

This project is now a single full-stack Next.js app on Vercel.

Set this environment variable (locally and in Vercel):

- `DATABASE_URL` (Neon PostgreSQL connection string)

## API Routes

- `GET /api/all` -> dashboard aggregate data
- `GET /api/filter` -> advanced filtered job records

Example:

```text
/api/filter?title=data%20analyst&country=united%20states&min_salary=60000&max_salary=180000&remote=true&limit=30
```

## Notes

- `app/api/filter/route.ts` and `app/api/all/route.ts` query Neon directly using `pg`.
- No Flask backend is required.
