"""
seed_db.py

Reads backend/precomputed_data.json and seeds PostgreSQL table `job_records`
using DATABASE_URL from environment.

Usage:
  python seed_db.py
  python seed_db.py --json-path backend/precomputed_data.json --truncate
"""

import argparse
import json
import os
from pathlib import Path

from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values


load_dotenv()


def parse_args():
    parser = argparse.ArgumentParser(description="Seed PostgreSQL with job_records data")
    parser.add_argument(
        "--json-path",
        default=str(Path(__file__).resolve().parent / "precomputed_data.json"),
        help="Path to precomputed_data.json",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Truncate job_records table before insert",
    )
    return parser.parse_args()


def normalize_bool(value):
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in {"true", "1", "yes", "y"}


def load_records(json_path):
    path = Path(json_path)
    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        payload = json.load(f)

    records = payload.get("job_records")
    if not isinstance(records, list):
        raise ValueError("JSON does not contain a valid 'job_records' list")

    return records


def get_connection(database_url):
    kwargs = {"dsn": database_url}
    if "sslmode=" not in database_url:
        kwargs["sslmode"] = "require"
    return psycopg2.connect(**kwargs)


def ensure_schema(cur):
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS job_records (
            id BIGSERIAL PRIMARY KEY,
            job_title TEXT NOT NULL,
            country TEXT NOT NULL,
            location TEXT NOT NULL,
            avg_salary INTEGER NULL,
            remote BOOLEAN NOT NULL DEFAULT FALSE,
            job_schedule_type TEXT NOT NULL,
            company TEXT NOT NULL
        );
        """
    )

    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_job_records_title_lower ON job_records (LOWER(job_title));"
    )
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_job_records_country_lower ON job_records (LOWER(country));"
    )
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_job_records_salary ON job_records (avg_salary);"
    )
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_job_records_remote ON job_records (remote);"
    )


def seed_records(cur, records):
    tuples = []
    for r in records:
        salary = r.get("avg_salary")
        if salary is not None:
            try:
                salary = int(salary)
            except (TypeError, ValueError):
                salary = None

        tuples.append(
            (
                str(r.get("job_title") or "").strip(),
                str(r.get("country") or "Unknown").strip() or "Unknown",
                str(r.get("location") or "Unknown").strip() or "Unknown",
                salary,
                normalize_bool(r.get("remote")),
                str(r.get("job_schedule_type") or "Unknown").strip() or "Unknown",
                str(r.get("company") or "Unknown").strip() or "Unknown",
            )
        )

    execute_values(
        cur,
        """
        INSERT INTO job_records (
            job_title,
            country,
            location,
            avg_salary,
            remote,
            job_schedule_type,
            company
        ) VALUES %s
        """,
        tuples,
        page_size=5000,
    )


def main():
    args = parse_args()
    database_url = os.environ.get("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is required")

    records = load_records(args.json_path)
    print(f"Loaded {len(records):,} records from {args.json_path}")

    with get_connection(database_url) as conn:
        with conn.cursor() as cur:
            ensure_schema(cur)

            if args.truncate:
                cur.execute("TRUNCATE TABLE job_records;")
                print("Truncated existing job_records rows")

            seed_records(cur, records)

        conn.commit()

    print("Seed completed successfully")


if __name__ == "__main__":
    main()
