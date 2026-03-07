"""
analyze.py — FYP: Extracting Market Trends from Real-World Job Postings
Student: Muhammad Haris, BZU Multan

Run this script ONCE to generate precomputed_data.json
Command: python analyze.py

This script:
1. Loads lukebarousse/data_jobs from HuggingFace
2. Cleans and processes data with pandas
3. Computes all metrics needed by the dashboard UI
4. Saves everything to precomputed_data.json
"""

import json
import ast
import pandas as pd
import numpy as np
from datasets import load_dataset
from datetime import datetime

print("=" * 60)
print("FYP Analysis Script — Muhammad Haris")
print("=" * 60)

# ─────────────────────────────────────────────
# 1. LOAD DATASET
# ─────────────────────────────────────────────
print("\n[1/6] Loading dataset from HuggingFace...")
dataset = load_dataset("lukebarousse/data_jobs", split="train")
df = dataset.to_pandas()
print(f"      Loaded {len(df):,} rows, {len(df.columns)} columns")
print(f"      Columns: {list(df.columns)}")

# ─────────────────────────────────────────────
# 2. DATA CLEANING
# ─────────────────────────────────────────────
print("\n[2/6] Cleaning data...")

# Drop rows with no job title
df = df.dropna(subset=["job_title_short"])

# Parse job_posted_date to datetime
df["job_posted_date"] = pd.to_datetime(df["job_posted_date"], errors="coerce")

# Clean salary columns — keep only yearly salaries
df["salary_year_avg"] = pd.to_numeric(df["salary_year_avg"], errors="coerce")
df["salary_year_avg"] = df["salary_year_avg"].where(
    (df["salary_year_avg"] >= 20000) & (df["salary_year_avg"] <= 600000)
)

# Normalize job title casing
df["job_title_short"] = df["job_title_short"].str.strip()

# Parse job_skills — stored as string representation of a list
def parse_skills(val):
    if pd.isna(val):
        return []
    if isinstance(val, list):
        return val
    try:
        parsed = ast.literal_eval(val)
        if isinstance(parsed, list):
            return [s.strip().lower() for s in parsed]
    except Exception:
        pass
    return []

df["skills_list"] = df["job_skills"].apply(parse_skills)

# Add month + year columns for trend analysis
df["year"] = df["job_posted_date"].dt.year
df["month"] = df["job_posted_date"].dt.month
df["year_month"] = df["job_posted_date"].dt.to_period("M").astype(str)

print(f"      After cleaning: {len(df):,} rows")
print(f"      Salary data available for: {df['salary_year_avg'].notna().sum():,} rows")
print(f"      Rows with skills: {(df['skills_list'].str.len() > 0).sum():,}")

# ─────────────────────────────────────────────
# 3. SUMMARY STATS (for Dashboard cards)
# ─────────────────────────────────────────────
print("\n[3/6] Computing summary statistics...")

total_jobs = int(len(df))
avg_salary = int(df["salary_year_avg"].dropna().mean())
active_companies = int(df["company_name"].nunique())

# Market growth: compare last 3 months vs previous 3 months
df_dated = df.dropna(subset=["job_posted_date"])
if len(df_dated) > 0:
    latest_date = df_dated["job_posted_date"].max()
    cutoff_recent = latest_date - pd.DateOffset(months=3)
    cutoff_older = latest_date - pd.DateOffset(months=6)

    recent = len(df_dated[df_dated["job_posted_date"] >= cutoff_recent])
    older = len(df_dated[
        (df_dated["job_posted_date"] >= cutoff_older) &
        (df_dated["job_posted_date"] < cutoff_recent)
    ])
    growth_pct = round(((recent - older) / max(older, 1)) * 100, 1) if older > 0 else 0.0
else:
    growth_pct = 0.0

summary_stats = {
    "total_jobs": total_jobs,
    "avg_salary": avg_salary,
    "active_companies": active_companies,
    "market_growth": f"{growth_pct:+.1f}%",
}
print(f"      Total jobs: {total_jobs:,}")
print(f"      Avg salary: ${avg_salary:,}")
print(f"      Companies: {active_companies:,}")
print(f"      Market growth: {growth_pct:+.1f}%")

# ─────────────────────────────────────────────
# 4. JOB TITLE ANALYSIS
# ─────────────────────────────────────────────
print("\n[4/6] Analyzing job titles...")

# Top job titles by count
title_counts = df["job_title_short"].value_counts()
top_titles = title_counts.head(10)

top_titles_list = [
    {"title": str(t), "count": int(c), "pct": round(int(c) / total_jobs * 100, 1)}
    for t, c in top_titles.items()
]

# Salary by job title
salary_by_title = (
    df.groupby("job_title_short")["salary_year_avg"]
    .agg(["mean", "median", "min", "max", "count"])
    .round(0)
    .dropna()
    .sort_values("median", ascending=False)
    .head(10)
)

salary_by_title_list = [
    {
        "title": str(title),
        "avg": int(row["mean"]),
        "median": int(row["median"]),
        "min": int(row["min"]),
        "max": int(row["max"]),
        "count": int(row["count"]),
    }
    for title, row in salary_by_title.iterrows()
]

print(f"      Top title: {top_titles_list[0]['title']} ({top_titles_list[0]['count']:,} postings)")

# ─────────────────────────────────────────────
# 5. SKILLS ANALYSIS
# ─────────────────────────────────────────────
print("\n[5/6] Analyzing skills...")

# Explode skills into individual rows
df_skills = df.explode("skills_list")
df_skills = df_skills[df_skills["skills_list"].str.len() > 0]
df_skills = df_skills.rename(columns={"skills_list": "skill"})

# Overall top skills by demand (% of job postings that mention skill)
skill_counts = df_skills["skill"].value_counts()
top_skills = skill_counts.head(20)

top_skills_list = [
    {
        "skill": str(s),
        "count": int(c),
        "pct": round(int(c) / total_jobs * 100, 1),
    }
    for s, c in top_skills.items()
]

# Skills by job title (top 5 skills per top 6 titles)
skills_by_title = {}
for title in title_counts.head(6).index:
    title_df = df_skills[df_skills["job_title_short"] == title]
    title_skill_counts = title_df["skill"].value_counts().head(8)
    title_total = title_counts[title]
    skills_by_title[str(title)] = [
        {
            "skill": str(s),
            "count": int(c),
            "pct": round(int(c) / title_total * 100, 1),
        }
        for s, c in title_skill_counts.items()
    ]

# Salary vs skill demand (optimal skills)
# For each top skill: median salary of jobs that require it + demand %
skill_salary = (
    df_skills.groupby("skill")["salary_year_avg"]
    .agg(["median", "count"])
    .dropna()
    .reset_index()
)
skill_salary = skill_salary[skill_salary["count"] >= 100]  # min 100 postings
skill_salary["demand_pct"] = (skill_salary["count"] / total_jobs * 100).round(1)
skill_salary["median_salary"] = skill_salary["median"].round(0).astype(int)
skill_salary = skill_salary.sort_values("median", ascending=False).head(20)

optimal_skills_list = [
    {
        "skill": str(row["skill"]),
        "median_salary": int(row["median_salary"]),
        "demand_pct": float(row["demand_pct"]),
        "count": int(row["count"]),
    }
    for _, row in skill_salary.iterrows()
]

print(f"      Top skill: {top_skills_list[0]['skill']} ({top_skills_list[0]['pct']}% of postings)")
print(f"      Unique skills found: {len(skill_counts):,}")

# ─────────────────────────────────────────────
# 5b. SKILL TRENDS OVER TIME
# ─────────────────────────────────────────────
print("      Computing skill trends over time...")

top_10_skills = [s["skill"] for s in top_skills_list[:10]]

skill_trend_df = df_skills[
    (df_skills["skill"].isin(top_10_skills)) &
    (df_skills["year_month"].notna())
]

# Count postings per skill per month
skill_trend = (
    skill_trend_df.groupby(["year_month", "skill"])
    .size()
    .reset_index(name="count")
)

# Pivot to wide format
skill_trend_pivot = skill_trend.pivot(
    index="year_month", columns="skill", values="count"
).fillna(0).reset_index()

skill_trend_pivot = skill_trend_pivot.sort_values("year_month")

skill_trends_list = skill_trend_pivot.to_dict(orient="records")
# Convert float counts to int
for row in skill_trends_list:
    for k, v in row.items():
        if k != "year_month":
            row[k] = int(v)

# ─────────────────────────────────────────────
# 5c. SALARY TRENDS OVER TIME
# ─────────────────────────────────────────────
salary_trend = (
    df.dropna(subset=["year_month", "salary_year_avg"])
    .groupby("year_month")["salary_year_avg"]
    .agg(["mean", "median", "min", "max"])
    .round(0)
    .reset_index()
    .sort_values("year_month")
)

salary_trends_list = [
    {
        "month": str(row["year_month"]),
        "avg": int(row["mean"]),
        "median": int(row["median"]),
        "min": int(row["min"]),
        "max": int(row["max"]),
    }
    for _, row in salary_trend.iterrows()
]

# ─────────────────────────────────────────────
# 6. LOCATION & REMOTE ANALYSIS
# ─────────────────────────────────────────────
print("\n[6/6] Analyzing location and remote work...")

# Remote vs on-site vs hybrid
if "job_work_from_home" in df.columns:
    remote_counts = df["job_work_from_home"].value_counts()
    remote_true = int(remote_counts.get(True, 0))
    remote_false = int(remote_counts.get(False, 0))
    total_with_remote = remote_true + remote_false
    remote_breakdown = {
        "remote": remote_true,
        "onsite": remote_false,
        "remote_pct": round(remote_true / max(total_with_remote, 1) * 100, 1),
        "onsite_pct": round(remote_false / max(total_with_remote, 1) * 100, 1),
    }
else:
    remote_breakdown = {"remote": 0, "onsite": 0, "remote_pct": 0, "onsite_pct": 0}

# Top countries
if "job_country" in df.columns:
    country_counts = df["job_country"].value_counts().head(10)
    top_countries = [
        {"country": str(c), "count": int(n)}
        for c, n in country_counts.items()
    ]
else:
    top_countries = []

print(f"      Remote jobs: {remote_breakdown['remote_pct']}%")

# ─────────────────────────────────────────────
# SAVE ALL OUTPUT
# ─────────────────────────────────────────────
output = {
    "meta": {
        "generated_at": datetime.utcnow().isoformat(),
        "total_rows_processed": total_jobs,
        "dataset": "lukebarousse/data_jobs",
    },
    "summary_stats": summary_stats,
    "top_titles": top_titles_list,
    "salary_by_title": salary_by_title_list,
    "top_skills": top_skills_list,
    "skills_by_title": skills_by_title,
    "optimal_skills": optimal_skills_list,
    "skill_trends": skill_trends_list,
    "salary_trends": salary_trends_list,
    "remote_breakdown": remote_breakdown,
    "top_countries": top_countries,
}

output_path = "precomputed_data.json"
with open(output_path, "w") as f:
    json.dump(output, f, indent=2, default=str)

print("\n" + "=" * 60)
print(f"SUCCESS — saved to {output_path}")
print(f"Keys: {list(output.keys())}")
print("=" * 60)
print("\nNext step: run app.py to serve this data via Flask API")