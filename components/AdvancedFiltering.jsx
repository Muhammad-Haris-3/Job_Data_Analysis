"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "./ThemeContext";

function useHover() {
  const [hovered, setHovered] = useState(false);
  return {
    hovered,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  isMobile,
}) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, TEXT, MUTED } = theme;
  const [focused, setFocused] = useState(false);

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: isMobile ? 10 : 11,
          color: MUTED,
          letterSpacing: 1,
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: CARD,
          border: `1px solid ${focused ? `${CYAN}88` : BORDER}`,
          borderRadius: 10,
          padding: "10px 12px",
          color: TEXT,
          fontSize: isMobile ? 12 : 13,
          fontFamily: "'JetBrains Mono', monospace",
          outline: "none",
          transition: "border-color 0.2s ease",
        }}
      />
    </label>
  );
}

function FilterActions({ onApply, onReset, loading, isMobile }) {
  const { theme } = useTheme();
  const { CYAN, BORDER, MUTED, CARD, TEXT } = theme;
  const applyHover = useHover();
  const resetHover = useHover();

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: isMobile ? "stretch" : "flex-end",
      }}
    >
      <button
        onClick={onReset}
        onMouseEnter={resetHover.onMouseEnter}
        onMouseLeave={resetHover.onMouseLeave}
        disabled={loading}
        style={{
          background: resetHover.hovered ? `${MUTED}1f` : CARD,
          color: resetHover.hovered ? TEXT : MUTED,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: isMobile ? 11 : 12,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          cursor: loading ? "not-allowed" : "pointer",
          flex: isMobile ? 1 : "none",
        }}
      >
        RESET
      </button>
      <button
        onClick={onApply}
        onMouseEnter={applyHover.onMouseEnter}
        onMouseLeave={applyHover.onMouseLeave}
        disabled={loading}
        style={{
          background: applyHover.hovered ? `${CYAN}dd` : CYAN,
          color: "#001018",
          border: "none",
          borderRadius: 10,
          padding: "10px 16px",
          fontSize: isMobile ? 11 : 12,
          fontWeight: 800,
          letterSpacing: 0.5,
          fontFamily: "'JetBrains Mono', monospace",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: `0 0 18px ${CYAN}33`,
          flex: isMobile ? 1 : "none",
        }}
      >
        {loading ? "FILTERING..." : "APPLY FILTERS"}
      </button>
    </div>
  );
}

function JobResultCard({ job, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, MUTED, TEXT, ACCENT_GREEN, ACCENT_YELLOW } =
    theme;
  const hover = useHover();

  const salaryLabel =
    typeof job.avg_salary === "number"
      ? `$${job.avg_salary.toLocaleString()}`
      : "N/A";
  const remoteLabel = job.remote ? "Remote" : "On-site / Hybrid";

  return (
    <div
      onMouseEnter={hover.onMouseEnter}
      onMouseLeave={hover.onMouseLeave}
      style={{
        border: `1px solid ${hover.hovered ? `${CYAN}55` : BORDER}`,
        background: hover.hovered ? `${CYAN}08` : CARD,
        borderRadius: 12,
        padding: isMobile ? "12px" : "14px",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: isMobile ? 13 : 14,
              color: TEXT,
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={job.job_title}
          >
            {job.job_title || "Unknown Role"}
          </div>
          <div
            style={{
              marginTop: 3,
              fontSize: 11,
              color: MUTED,
              fontFamily: "monospace",
            }}
          >
            {job.company || "Unknown Company"}
          </div>
        </div>
        <div
          style={{
            fontSize: isMobile ? 12 : 13,
            color: ACCENT_GREEN,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {salaryLabel}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginTop: 10,
        }}
      >
        <div style={{ fontSize: 11, color: MUTED }}>
          <span style={{ color: CYAN }}>REMOTE:</span> {remoteLabel}
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>
          <span style={{ color: CYAN }}>SCHEDULE:</span>{" "}
          {job.job_schedule_type || "Unknown"}
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: ACCENT_YELLOW }}>
        LOCATION: {job.location || "Unknown"}, {job.country || "Unknown"}
      </div>
    </div>
  );
}

export default function AdvancedFiltering({ isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, MUTED, TEXT, RED } = theme;

  const [jobTitle, setJobTitle] = useState("");
  const [country, setCountry] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (jobTitle.trim()) count += 1;
    if (country.trim()) count += 1;
    if (minSalary.trim()) count += 1;
    if (maxSalary.trim()) count += 1;
    if (remoteOnly) count += 1;
    return count;
  }, [jobTitle, country, minSalary, maxSalary, remoteOnly]);

  const fetchFiltered = async (custom = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const title = custom.jobTitle ?? jobTitle;
      const ctry = custom.country ?? country;
      const min = custom.minSalary ?? minSalary;
      const max = custom.maxSalary ?? maxSalary;
      const remote = custom.remoteOnly ?? remoteOnly;

      if (title.trim()) params.set("title", title.trim());
      if (ctry.trim()) params.set("country", ctry.trim());
      if (min.trim()) params.set("min_salary", min.trim());
      if (max.trim()) params.set("max_salary", max.trim());
      if (remote) params.set("remote", "true");
      params.set("limit", "30");

      const res = await fetch(`/api/filter?${params.toString()}`, {
        cache: "no-store",
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }

      setResults(Array.isArray(payload.results) ? payload.results : []);
      setTotal(typeof payload.total === "number" ? payload.total : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        margin: isMobile ? "14px 14px 0" : "20px 32px 0",
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: isMobile ? 12 : 14,
        padding: isMobile ? "14px" : "22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{ width: 8, height: 8, borderRadius: "50%", background: CYAN }}
        />
        <span
          style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: 1,
          }}
        >
          ADVANCED FILTERING
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: MUTED,
            fontFamily: "monospace",
          }}
        >
          {activeFilterCount} ACTIVE FILTERS
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 0.8fr 0.8fr",
          gap: 10,
        }}
      >
        <FilterInput
          label="JOB TITLE"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Data Analyst"
          isMobile={isMobile}
        />
        <FilterInput
          label="COUNTRY"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g. United States"
          isMobile={isMobile}
        />
        <FilterInput
          label="MIN SALARY"
          type="number"
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
          placeholder="50000"
          isMobile={isMobile}
        />
        <FilterInput
          label="MAX SALARY"
          type="number"
          value={maxSalary}
          onChange={(e) => setMaxSalary(e.target.value)}
          placeholder="200000"
          isMobile={isMobile}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: remoteOnly ? TEXT : MUTED,
            fontSize: 12,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            style={{ accentColor: CYAN, width: 15, height: 15 }}
          />
          REMOTE JOBS ONLY
        </label>

        <FilterActions
          loading={loading}
          isMobile={isMobile}
          onApply={() => fetchFiltered()}
          onReset={() => {
            const defaults = {
              jobTitle: "",
              country: "",
              minSalary: "",
              maxSalary: "",
              remoteOnly: false,
            };
            setJobTitle(defaults.jobTitle);
            setCountry(defaults.country);
            setMinSalary(defaults.minSalary);
            setMaxSalary(defaults.maxSalary);
            setRemoteOnly(defaults.remoteOnly);
            fetchFiltered(defaults);
          }}
        />
      </div>

      {error && (
        <div
          style={{
            marginTop: 12,
            border: `1px solid ${RED}55`,
            borderRadius: 10,
            padding: "10px 12px",
            color: RED,
            fontSize: 12,
            fontFamily: "monospace",
            background: `${RED}11`,
          }}
        >
          FILTER ERROR: {error}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, color: MUTED, fontFamily: "monospace" }}>
          SHOWING {results.length.toLocaleString()} OF {total.toLocaleString()}{" "}
          MATCHES
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 10,
          maxHeight: isMobile ? 460 : 520,
          overflowY: "auto",
          paddingRight: 2,
        }}
      >
        {loading && (
          <div style={{ color: MUTED, fontSize: 12, fontFamily: "monospace" }}>
            Loading filtered jobs...
          </div>
        )}
        {!loading && results.length === 0 && (
          <div
            style={{
              color: MUTED,
              fontSize: 12,
              fontFamily: "monospace",
              border: `1px dashed ${BORDER}`,
              borderRadius: 10,
              padding: "14px",
            }}
          >
            No matching jobs found for current filters.
          </div>
        )}
        {!loading &&
          results.map((job, idx) => (
            <JobResultCard
              key={`${job.job_title}-${job.company}-${idx}`}
              job={job}
              isMobile={isMobile}
            />
          ))}
      </div>
    </div>
  );
}
