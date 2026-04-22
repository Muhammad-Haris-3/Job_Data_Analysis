import { Pool } from "pg";
import { NextRequest, NextResponse } from "next/server";

const DATABASE_URL = process.env.DATABASE_URL;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JobRecord = {
  job_title: string;
  country: string;
  location: string;
  avg_salary: number | null;
  remote: boolean;
  job_schedule_type: string;
  company: string;
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

function parseBool(value: string | null): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "y"].includes(value.toLowerCase());
}

function parseIntOrZero(value: string | null): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    const searchParams = req.nextUrl.searchParams;

    const titleRaw = (searchParams.get("title") || "").trim();
    const countryRaw = (searchParams.get("country") || "").trim();
    const title = titleRaw.toLowerCase();
    const country = countryRaw.toLowerCase();
    const minSalary = parseIntOrZero(searchParams.get("min_salary"));
    const maxSalary = parseIntOrZero(searchParams.get("max_salary"));
    const remoteOnly = parseBool(searchParams.get("remote"));
    const limit = Math.min(
      parseIntOrZero(searchParams.get("limit")) || 50,
      200,
    );
    const offset = parseIntOrZero(searchParams.get("offset"));

    if (maxSalary && minSalary && maxSalary < minSalary) {
      return NextResponse.json(
        { error: "max_salary cannot be less than min_salary" },
        { status: 400 },
      );
    }

    const conditions: string[] = [];
    const values: Array<string | number | boolean> = [];

    if (title) {
      values.push(`%${title}%`);
      conditions.push(`LOWER(job_title) ILIKE $${values.length}`);
    }

    if (country) {
      values.push(`%${country}%`);
      conditions.push(`LOWER(country) ILIKE $${values.length}`);
    }

    if (minSalary) {
      values.push(minSalary);
      conditions.push(
        `avg_salary IS NOT NULL AND avg_salary >= $${values.length}`,
      );
    }

    if (maxSalary) {
      values.push(maxSalary);
      conditions.push(
        `avg_salary IS NOT NULL AND avg_salary <= $${values.length}`,
      );
    }

    if (remoteOnly) {
      values.push(true);
      conditions.push(`remote = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*)::int AS total FROM job_records ${whereClause}`;
    const countResult = await pool.query<{ total: number }>(countQuery, values);
    const total = countResult.rows[0]?.total ?? 0;

    const paginatedValues = [...values, limit, offset];
    const resultsQuery = `
      SELECT
        job_title,
        country,
        location,
        avg_salary,
        remote,
        job_schedule_type,
        company
      FROM job_records
      ${whereClause}
      ORDER BY (avg_salary IS NULL) ASC, avg_salary DESC, job_title ASC
      LIMIT $${paginatedValues.length - 1}
      OFFSET $${paginatedValues.length}
    `;

    const resultsResult = await pool.query<JobRecord>(
      resultsQuery,
      paginatedValues,
    );

    const results = resultsResult.rows.map((row) => ({
      job_title: row.job_title,
      country: row.country,
      location: row.location,
      avg_salary: row.avg_salary,
      remote: Boolean(row.remote),
      job_schedule_type: row.job_schedule_type,
      company: row.company,
    }));

    return NextResponse.json(
      {
        filters: {
          title: titleRaw,
          country: countryRaw,
          min_salary: minSalary,
          max_salary: maxSalary,
          remote: remoteOnly,
          limit,
          offset,
        },
        total,
        returned: results.length,
        results,
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to load filtered job data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
