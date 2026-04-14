import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_DATA_PATH = path.join(
  process.cwd(),
  "backend",
  "precomputed_data.json",
);

async function getLocalData() {
  const file = await readFile(LOCAL_DATA_PATH, "utf-8");
  return JSON.parse(file);
}

export async function GET() {
  const backendBase = BACKEND_API_URL.replace(/\/$/, "");
  const backendUrl = `${backendBase}/api/all`;

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
      return NextResponse.json(localData, {
        status: 200,
        headers: {
          "x-data-source": "local-fallback",
          "cache-control": "no-store",
        },
      });
    } catch (localError) {
      return NextResponse.json(
        {
          error: "Unable to load dashboard data",
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
