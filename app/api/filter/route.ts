import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_DATA_PATHS = [
  path.join(process.cwd(), "precomputed_data.json"),
  path.join(process.cwd(), "backend", "precomputed_data.json"),
];

type LocalJobRecord = {
  job_title?: string;
  country?: string;
  location?: string;
  avg_salary?: number | null;
  remote?: boolean;
  job_schedule_type?: string;
  company?: string;
};

async function getLocalData() {
  let lastError: unknown = null;

  for (const candidatePath of LOCAL_DATA_PATHS) {
    try {
      const file = await readFile(candidatePath, "utf-8");
      return JSON.parse(file);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `Local fallback data not found in any path: ${LOCAL_DATA_PATHS.join(", ")}. Last error: ${String(lastError)}`,
  );
}

function parseBool(v: string | null): boolean {
  if (!v) return false;
  return ["1", "true", "yes", "y"].includes(v.toLowerCase());
}

function parseIntOrZero(v: string | null): number {
  if (!v) return 0;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function applyLocalFilter(
  records: LocalJobRecord[],
  searchParams: URLSearchParams,
) {
  const title = (searchParams.get("title") || "").trim().toLowerCase();
  const country = (searchParams.get("country") || "").trim().toLowerCase();
  const minSalary = parseIntOrZero(searchParams.get("min_salary"));
  const maxSalary = parseIntOrZero(searchParams.get("max_salary"));
  const remoteOnly = parseBool(searchParams.get("remote"));
  const limit = Math.min(parseIntOrZero(searchParams.get("limit")) || 50, 200);
  const offset = parseIntOrZero(searchParams.get("offset"));

  const filtered = records.filter((job) => {
    if (
      title &&
      !String(job.job_title || "")
        .toLowerCase()
        .includes(title)
    ) {
      return false;
    }
    if (
      country &&
      !String(job.country || "")
        .toLowerCase()
        .includes(country)
    ) {
      return false;
    }

    const salary = typeof job.avg_salary === "number" ? job.avg_salary : null;
    if (minSalary && (salary === null || salary < minSalary)) return false;
    if (maxSalary && (salary === null || salary > maxSalary)) return false;
    if (remoteOnly && !Boolean(job.remote)) return false;

    return true;
  });

  filtered.sort(
    (a, b) =>
      (b.avg_salary || 0) - (a.avg_salary || 0) ||
      String(a.job_title || "").localeCompare(String(b.job_title || "")),
  );

  const page = filtered.slice(offset, offset + limit);

  return {
    filters: {
      title: searchParams.get("title") || "",
      country: searchParams.get("country") || "",
      min_salary: minSalary,
      max_salary: maxSalary,
      remote: remoteOnly,
      limit,
      offset,
    },
    total: filtered.length,
    returned: page.length,
    results: page,
  };
}

export async function GET(req: NextRequest) {
  const backendBase = BACKEND_API_URL.replace(/\/$/, "");
  const queryString = req.nextUrl.searchParams.toString();
  const backendUrl = `${backendBase}/api/filter${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(backendUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const body = await response.text();

    if (!response.ok) {
      throw new Error(
        `Backend responded with HTTP ${response.status}: ${body.slice(0, 300)}`,
      );
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type":
          response.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (backendError) {
    try {
      const localData = await getLocalData();
      const localRecords = Array.isArray(localData?.job_records)
        ? localData.job_records
        : [];
      const payload = applyLocalFilter(localRecords, req.nextUrl.searchParams);

      return NextResponse.json(payload, {
        status: 200,
        headers: {
          "x-data-source": "local-fallback",
          "cache-control": "no-store",
        },
      });
    } catch (localError) {
      return NextResponse.json(
        {
          error: "Unable to load filtered job data",
          backendUrl,
          backendDetails:
            backendError instanceof Error
              ? backendError.message
              : String(backendError),
          localDetails:
            localError instanceof Error
              ? localError.message
              : String(localError),
        },
        { status: 500 },
      );
    }
  }
}
