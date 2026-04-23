import { Pool } from "pg";
import { NextResponse } from "next/server";
import precomputedData from "../../../precomputed_data.json";

const DATABASE_URL = process.env.DATABASE_URL;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SummaryRow = {
  total_jobs: number;
  avg_salary: number;
  active_companies: number;
};

type TitleRow = {
  title: string;
  count: number;
};

type SalaryByTitleRow = {
  title: string;
  avg: number;
  median: number;
  min: number;
  max: number;
  count: number;
};

type CountryRow = {
  country: string;
  count: number;
};

type RemoteRow = {
  remote: number;
  onsite: number;
};

type SalarySnapshotRow = {
  avg: number | null;
  min: number | null;
  max: number | null;
};

type SkillRow = {
  skill: string;
  count: number;
  pct: number;
};

type OptimalSkillRow = {
  skill: string;
  median_salary: number;
  demand_pct: number;
  count: number;
};

type SalaryTrendRow = {
  month: string;
  avg: number;
  median: number;
  min: number;
  max: number;
};

type PrecomputedPayload = {
  meta?: {
    generated_at?: string;
    total_rows_processed?: number;
    dataset?: string;
  };
  summary_stats?: {
    total_jobs?: number;
    avg_salary?: number;
    active_companies?: number;
    market_growth?: string;
  };
  top_skills?: SkillRow[];
  skills_by_title?: Record<string, SkillRow[]>;
  optimal_skills?: OptimalSkillRow[];
  skill_trends?: Array<Record<string, number | string>>;
  salary_trends?: SalaryTrendRow[];
};

declare global {
  var __jobMarketDbPool: Pool | undefined;
}

function getPool() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!global.__jobMarketDbPool) {
    global.__jobMarketDbPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }

  return global.__jobMarketDbPool;
}

function toSafePrecomputedPayload(): PrecomputedPayload {
  return (precomputedData ?? {}) as PrecomputedPayload;
}

function computeMarketGrowthFromTrends(
  trends: SalaryTrendRow[],
): string | null {
  if (!Array.isArray(trends) || trends.length < 2) return null;

  const first = trends[0]?.avg;
  const last = trends[trends.length - 1]?.avg;
  if (!first || !last) return null;

  const growthPct = ((last - first) / first) * 100;
  const sign = growthPct >= 0 ? "+" : "";
  return `${sign}${growthPct.toFixed(1)}%`;
}

function buildPrecomputedOnlyPayload(details?: string) {
  const precomputed = toSafePrecomputedPayload();
  const salaryTrends = Array.isArray(precomputed.salary_trends)
    ? precomputed.salary_trends
    : [];

  return {
    meta: {
      generated_at: new Date().toISOString(),
      total_rows_processed: precomputed.meta?.total_rows_processed ?? 0,
      dataset: precomputed.meta?.dataset ?? "precomputed_data.json",
      degraded_mode: true,
    },
    summary_stats: {
      total_jobs: precomputed.summary_stats?.total_jobs ?? 0,
      avg_salary: precomputed.summary_stats?.avg_salary ?? 0,
      active_companies: precomputed.summary_stats?.active_companies ?? 0,
      market_growth:
        computeMarketGrowthFromTrends(salaryTrends) ??
        precomputed.summary_stats?.market_growth ??
        "+0.0%",
    },
    top_titles: [],
    salary_by_title: [],
    top_skills: Array.isArray(precomputed.top_skills)
      ? precomputed.top_skills
      : [],
    skills_by_title:
      typeof precomputed.skills_by_title === "object" &&
      precomputed.skills_by_title !== null
        ? precomputed.skills_by_title
        : {},
    optimal_skills: Array.isArray(precomputed.optimal_skills)
      ? precomputed.optimal_skills
      : [],
    skill_trends: Array.isArray(precomputed.skill_trends)
      ? precomputed.skill_trends
      : [],
    salary_trends: salaryTrends,
    remote_breakdown: {
      remote: 0,
      onsite: 0,
      remote_pct: 0,
      onsite_pct: 0,
    },
    top_countries: [],
    job_records: [],
    warning: details
      ? `Database unavailable: ${details}`
      : "Database unavailable",
  };
}

export async function GET() {
  try {
    const precomputed = toSafePrecomputedPayload();
    const pool = getPool();

    const [
      summaryRes,
      titlesRes,
      salaryByTitleRes,
      countriesRes,
      remoteRes,
      salarySnapshotRes,
    ] = await Promise.all([
      pool.query<SummaryRow>(`
          SELECT
            COUNT(*)::int AS total_jobs,
            COALESCE(ROUND(AVG(avg_salary))::int, 0) AS avg_salary,
            COUNT(DISTINCT company)::int AS active_companies
          FROM job_records
        `),
      pool.query<TitleRow>(`
          SELECT job_title AS title, COUNT(*)::int AS count
          FROM job_records
          GROUP BY job_title
          ORDER BY count DESC, title ASC
          LIMIT 10
        `),
      pool.query<SalaryByTitleRow>(`
          SELECT
            job_title AS title,
            ROUND(AVG(avg_salary))::int AS avg,
            ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY avg_salary))::int AS median,
            MIN(avg_salary)::int AS min,
            MAX(avg_salary)::int AS max,
            COUNT(avg_salary)::int AS count
          FROM job_records
          WHERE avg_salary IS NOT NULL
          GROUP BY job_title
          ORDER BY median DESC, title ASC
          LIMIT 10
        `),
      pool.query<CountryRow>(`
          SELECT country, COUNT(*)::int AS count
          FROM job_records
          GROUP BY country
          ORDER BY count DESC, country ASC
          LIMIT 10
        `),
      pool.query<RemoteRow>(`
          SELECT
            COUNT(*) FILTER (WHERE remote = TRUE)::int AS remote,
            COUNT(*) FILTER (WHERE remote = FALSE OR remote IS NULL)::int AS onsite
          FROM job_records
        `),
      pool.query<SalarySnapshotRow>(`
          SELECT
            ROUND(AVG(avg_salary))::int AS avg,
            MIN(avg_salary)::int AS min,
            MAX(avg_salary)::int AS max
          FROM job_records
          WHERE avg_salary IS NOT NULL
        `),
    ]);

    const summary = summaryRes.rows[0] || {
      total_jobs: 0,
      avg_salary: 0,
      active_companies: 0,
    };

    const topTitlesRaw = titlesRes.rows;
    const top_titles =
      topTitlesRaw.length > 0
        ? topTitlesRaw.map((row) => ({
            title: row.title,
            count: row.count,
            pct:
              summary.total_jobs > 0
                ? Number(((row.count / summary.total_jobs) * 100).toFixed(1))
                : 0,
          }))
        : [{ title: "Unknown", count: 0, pct: 0 }];

    const salary_by_title = salaryByTitleRes.rows.map((row) => ({
      title: row.title,
      avg: row.avg,
      median: row.median,
      min: row.min,
      max: row.max,
      count: row.count,
    }));

    const remoteStats = remoteRes.rows[0] || { remote: 0, onsite: 0 };
    const remoteTotal = remoteStats.remote + remoteStats.onsite;

    const remote_breakdown = {
      remote: remoteStats.remote,
      onsite: remoteStats.onsite,
      remote_pct:
        remoteTotal > 0
          ? Number(((remoteStats.remote / remoteTotal) * 100).toFixed(1))
          : 0,
      onsite_pct:
        remoteTotal > 0
          ? Number(((remoteStats.onsite / remoteTotal) * 100).toFixed(1))
          : 0,
    };

    const top_countries = countriesRes.rows.map((row) => ({
      country: row.country,
      count: row.count,
    }));

    const salarySnapshot = salarySnapshotRes.rows[0] || {
      avg: null,
      min: null,
      max: null,
    };

    const precomputedSalaryTrends = Array.isArray(precomputed.salary_trends)
      ? precomputed.salary_trends
      : [];

    const marketGrowth =
      computeMarketGrowthFromTrends(precomputedSalaryTrends) ??
      precomputed.summary_stats?.market_growth ??
      "+0.0%";

    // The original payload includes these keys; we keep exact key structure.
    const payload = {
      meta: {
        generated_at: new Date().toISOString(),
        total_rows_processed: summary.total_jobs,
        dataset: "neon/job_records + precomputed_data.json",
      },
      summary_stats: {
        total_jobs: summary.total_jobs,
        avg_salary: summary.avg_salary,
        active_companies: summary.active_companies,
        market_growth: marketGrowth,
      },
      top_titles,
      salary_by_title,
      top_skills: Array.isArray(precomputed.top_skills)
        ? precomputed.top_skills
        : [],
      skills_by_title:
        typeof precomputed.skills_by_title === "object" &&
        precomputed.skills_by_title !== null
          ? precomputed.skills_by_title
          : {},
      optimal_skills: Array.isArray(precomputed.optimal_skills)
        ? precomputed.optimal_skills
        : [],
      skill_trends: Array.isArray(precomputed.skill_trends)
        ? precomputed.skill_trends
        : [],
      salary_trends:
        precomputedSalaryTrends.length > 0
          ? precomputedSalaryTrends
          : salarySnapshot.avg
            ? [
                {
                  month: new Date().toISOString().slice(0, 7),
                  avg: salarySnapshot.avg,
                  median: salarySnapshot.avg,
                  min: salarySnapshot.min ?? salarySnapshot.avg,
                  max: salarySnapshot.max ?? salarySnapshot.avg,
                },
              ]
            : [],
      remote_breakdown,
      top_countries,
      job_records: [],
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(buildPrecomputedOnlyPayload(details), {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    });
  }
}
