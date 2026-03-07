"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Hover Hook ───────────────────────────────────────────────
function useHover() {
  const [hovered, setHovered] = useState(false);
  return {
    hovered,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
}

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton({ width = "100%", height = 32, style = {} }) {
  const { theme } = useTheme();
  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(90deg, ${theme.BORDER} 25%, ${theme.CARD_HOVER} 50%, ${theme.BORDER} 75%)`,
        backgroundSize: "200% 100%",
        borderRadius: 6,
        ...style,
      }}
    />
  );
}

// ── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  const { theme } = useTheme();
  const { BORDER, TEXT, MUTED, TOOLTIP_BG } = theme;
  if (!active || !payload?.length) return null;
  const fullLabel = payload[0]?.payload?.fullTitle || label;
  return (
    <div
      style={{
        background: TOOLTIP_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        color: TEXT,
      }}
    >
      <div style={{ color: MUTED, marginBottom: 6, fontWeight: 700 }}>
        {fullLabel}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>${p.value}k</strong>
        </div>
      ))}
    </div>
  );
};

const TITLE_ABBREVIATIONS = {
  "Senior Data Scientist": "Sr. DS",
  "Machine Learning Engineer": "MLE",
  "Data Engineer": "DE",
  "Software Engineer": "SWE",
  "Senior Data Engineer": "Sr. DE",
  "Senior Data Analyst": "Sr. DA",
  "Data Scientist": "DS",
  "Data Analyst": "DA",
};

function formatJobTitleTick(title) {
  if (!title) return "";
  const trimmed = title.trim();
  if (TITLE_ABBREVIATIONS[trimmed]) return TITLE_ABBREVIATIONS[trimmed];

  const abbreviated = trimmed
    .replace(/^Senior\b/i, "Sr.")
    .replace(/Machine Learning/gi, "ML")
    .replace(/Data Scientist/gi, "DS")
    .replace(/Data Engineer/gi, "DE")
    .replace(/Data Analyst/gi, "DA")
    .replace(/Software Engineer/gi, "SWE")
    .replace(/Engineer/gi, "Eng.")
    .replace(/Scientist/gi, "Sci.")
    .replace(/Analyst/gi, "Anl.");

  return abbreviated.length > 12
    ? `${abbreviated.slice(0, 10).trimEnd()}...`
    : abbreviated;
}

function getBenchmarkId(title) {
  const clean = (title || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `benchmark-${clean}`;
}

// ── Role Selector ────────────────────────────────────────────
function RoleSelector({ role, setRole, roles, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, TEXT } = theme;
  return (
    <div style={{ margin: isMobile ? "14px 14px 0" : "20px 32px 0" }}>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{
          width: "100%",
          backgroundColor: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: "10px 14px",
          color: TEXT,
          fontSize: isMobile ? 12 : 13,
          fontFamily: "'JetBrains Mono', monospace",
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%234a6080' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
        }}
      >
        {roles.map((r) => (
          <option key={r} value={r} style={{ backgroundColor: CARD }}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Salary By Title Chart ────────────────────────────────────
function SalaryByTitleChart({ salaryData, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, MUTED, TEXT, TOOLTIP_BG, ACCENT_GREEN } = theme;

  const chartData = salaryData.slice(0, 8).map((s) => ({
    name: s.title,
    min: Math.round(s.min / 1000),
    median: Math.round(s.median / 1000),
    max: Math.round(s.max / 1000),
    fullTitle: s.title,
  }));

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
          marginBottom: 6,
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
          SALARY BY JOB TITLE
        </span>
        <span
          style={{
            fontSize: 10,
            color: MUTED,
            marginLeft: "auto",
            fontFamily: "monospace",
          }}
        >
          REAL DATA · USD
        </span>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        {[
          ["Min", MUTED],
          ["Median", CYAN],
          ["Max", ACCENT_GREEN],
        ].map(([label, color]) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: color,
              }}
            />
            <span style={{ fontSize: 11, color: MUTED }}>{label}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 24, left: 24, bottom: 12 }}
          barGap={2}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={BORDER}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: MUTED, fontSize: isMobile ? 9 : 11 }}
            tickFormatter={formatJobTitleTick}
            interval={0}
            minTickGap={8}
            angle={0}
            textAnchor="middle"
            height={isMobile ? 30 : 26}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: isMobile ? 9 : 11 }}
            axisLine={false}
            tickLine={false}
            unit="k"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: `${CYAN}08` }} />
          <Bar
            dataKey="min"
            name="Min"
            fill={MUTED}
            radius={[3, 3, 0, 0]}
            barSize={isMobile ? 8 : 12}
          />
          <Bar
            dataKey="median"
            name="Median"
            fill={CYAN}
            radius={[3, 3, 0, 0]}
            barSize={isMobile ? 8 : 12}
          />
          <Bar
            dataKey="max"
            name="Max"
            fill={ACCENT_GREEN}
            radius={[3, 3, 0, 0]}
            barSize={isMobile ? 8 : 12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Title Card ───────────────────────────────────────────────
function TitleCard({ s, isMobile, isSelected, isHighlighted, onClick }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, MUTED, TEXT, SECONDARY_TEXT, ACCENT_GREEN } =
    theme;
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const active = hovered || isSelected;

  return (
    <div
      id={getBenchmarkId(s.title)}
      className={`transition-all duration-300 ${isHighlighted ? "ring-2 ring-teal-400" : ""}`}
      onClick={() => onClick(s.title)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: isSelected ? `${CYAN}10` : hovered ? `${CYAN}08` : CARD,
        border: `1px solid ${
          isHighlighted
            ? "#2dd4bf"
            : isSelected
              ? CYAN + "55"
              : hovered
                ? CYAN + "33"
                : BORDER
        }`,
        borderRadius: isMobile ? 10 : 12,
        padding: isMobile ? "12px" : "16px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: isHighlighted
          ? "0 0 0 3px rgba(45, 212, 191, 0.22)"
          : isSelected
            ? `0 0 12px ${CYAN}0f`
            : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              color: MUTED,
              letterSpacing: 1,
              marginBottom: 2,
            }}
          >
            {s.title.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: isMobile ? 18 : 22,
              fontWeight: 800,
              color: active ? TEXT : SECONDARY_TEXT,
            }}
          >
            ${Math.round(s.min / 1000)}k – ${Math.round(s.max / 1000)}k
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 6,
            background: `${ACCENT_GREEN}18`,
            border: `1px solid ${ACCENT_GREEN}44`,
            color: ACCENT_GREEN,
          }}
        >
          {s.count.toLocaleString()} jobs
        </div>
      </div>

      {/* Percentile Bar */}
      <div
        style={{
          position: "relative",
          height: 4,
          background: BORDER,
          borderRadius: 2,
          margin: "10px 0 6px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${(s.min / s.max) * 100}%`,
            width: `${((s.median - s.min) / s.max) * 100}%`,
            height: "100%",
            background: CYAN,
            borderRadius: 2,
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${(s.median / s.max) * 100}%`,
            transform: "translateX(-50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: CYAN,
            top: -2,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: MUTED,
        }}
      >
        <span>Min (${Math.round(s.min / 1000)}k)</span>
        <span style={{ color: CYAN }}>
          Median (${Math.round(s.median / 1000)}k)
        </span>
        <span>Max (${Math.round(s.max / 1000)}k)</span>
      </div>
    </div>
  );
}

// ── Benchmarks Grid ──────────────────────────────────────────
function Benchmarks({
  salaryData,
  selectedTitle,
  highlightedTitle,
  setSelectedTitle,
  isMobile,
}) {
  const { theme } = useTheme();
  const { TEXT, MUTED, ACCENT_YELLOW } = theme;
  return (
    <div style={{ margin: isMobile ? "14px 14px 0" : "20px 32px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: ACCENT_YELLOW,
            }}
          />
          <span
            style={{
              fontSize: isMobile ? 12 : 14,
              fontWeight: 700,
              color: TEXT,
              letterSpacing: 1,
            }}
          >
            SALARY BENCHMARKS
          </span>
        </div>
        <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
          REAL DATA
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 10 : 14,
        }}
      >
        {salaryData.map((s) => (
          <TitleCard
            key={s.title}
            s={s}
            isMobile={isMobile}
            isSelected={selectedTitle === s.title}
            isHighlighted={highlightedTitle === s.title}
            onClick={setSelectedTitle}
          />
        ))}
      </div>
    </div>
  );
}

// ── Remote Breakdown ─────────────────────────────────────────
function RemoteBreakdown({ remoteData, isMobile }) {
  const { theme } = useTheme();
  const {
    CARD,
    BORDER,
    CYAN,
    MUTED,
    TEXT,
    SECONDARY_TEXT,
    ACCENT_GREEN,
    ACCENT_PURPLE,
  } = theme;

  if (!remoteData) return null;

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
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ACCENT_PURPLE,
          }}
        />
        <span
          style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: 1,
          }}
        >
          REMOTE vs ON-SITE
        </span>
        <span
          style={{
            fontSize: 10,
            color: MUTED,
            marginLeft: "auto",
            fontFamily: "monospace",
          }}
        >
          REAL DATA
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {[
          ["🌐 REMOTE", remoteData.remote_pct, remoteData.remote, CYAN],
          [
            "🏢 ON-SITE",
            remoteData.onsite_pct,
            remoteData.onsite,
            ACCENT_GREEN,
          ],
        ].map(([label, pct, count, color]) => (
          <div
            key={label}
            style={{
              padding: "14px",
              background: `${color}0a`,
              border: `1px solid ${color}33`,
              borderRadius: 10,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>
              {label}
            </div>
            <div
              style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color }}
            >
              {pct}%
            </div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
              {count.toLocaleString()} jobs
            </div>
          </div>
        ))}
      </div>

      {/* Bar */}
      <div
        style={{
          height: 8,
          background: BORDER,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${remoteData.remote_pct}%`,
            background: `linear-gradient(90deg, ${CYAN}88, ${CYAN})`,
            borderRadius: 4,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          fontSize: 10,
          color: MUTED,
        }}
      >
        <span style={{ color: CYAN }}>Remote {remoteData.remote_pct}%</span>
        <span style={{ color: ACCENT_GREEN }}>
          On-site {remoteData.onsite_pct}%
        </span>
      </div>
    </div>
  );
}

// ── Top Countries ────────────────────────────────────────────
function TopCountries({ countries, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, MUTED, TEXT, ACCENT_YELLOW } = theme;

  if (!countries?.length) return null;
  const max = countries[0].count;

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
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ACCENT_YELLOW,
          }}
        />
        <span
          style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: 1,
          }}
        >
          TOP COUNTRIES
        </span>
        <span
          style={{
            fontSize: 10,
            color: MUTED,
            marginLeft: "auto",
            fontFamily: "monospace",
          }}
        >
          BY JOB COUNT
        </span>
      </div>
      {countries.slice(0, 8).map((c, i) => (
        <div key={c.country} style={{ marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: TEXT,
                fontWeight: i === 0 ? 700 : 400,
              }}
            >
              {c.country}
            </span>
            <span style={{ fontSize: 11, color: CYAN }}>
              {c.count.toLocaleString()} jobs
            </span>
          </div>
          <div style={{ height: 4, background: BORDER, borderRadius: 2 }}>
            <div
              style={{
                width: `${(c.count / max) * 100}%`,
                height: "100%",
                borderRadius: 2,
                background: `linear-gradient(90deg, ${CYAN}88, ${CYAN})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────
export default function SalaryMap({ isMobile, data, loading }) {
  const { theme } = useTheme();
  const { CYAN, TEXT, MUTED, ACCENT_YELLOW } = theme;

  const salaryData = data?.salary_by_title || [];
  const remoteData = data?.remote_breakdown || null;
  const countries = data?.top_countries || [];
  const roles = salaryData.map((s) => s.title);

  const [role, setRole] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [highlightedTitle, setHighlightedTitle] = useState(null);
  const highlightTimeoutRef = useRef(null);

  const activeRole = role || roles[0] || "Senior Data Scientist";

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const highlightAndScrollToBenchmark = (title) => {
    const card = document.getElementById(getBenchmarkId(title));
    if (!card) return;

    card.scrollIntoView({ behavior: "smooth", block: "center" });
    setSelectedTitle(title);
    setHighlightedTitle(title);

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedTitle(null);
    }, 2500);
  };

  const handleRoleSelection = (title) => {
    setRole(title);
    highlightAndScrollToBenchmark(title);
  };

  return (
    <div style={{ overflowY: "auto", flex: 1, paddingBottom: 32 }}>
      <div style={{ padding: isMobile ? "14px 14px 0" : "24px 32px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: ACCENT_YELLOW,
            }}
          />
          <span
            style={{
              fontSize: isMobile ? 16 : 20,
              fontWeight: 800,
              color: TEXT,
              letterSpacing: 1,
            }}
          >
            SALARY_MAP<span style={{ color: MUTED }}>.global</span>
          </span>
          {data && (
            <span
              style={{
                fontSize: 10,
                color: MUTED,
                marginLeft: 8,
                fontFamily: "monospace",
                padding: "2px 8px",
                borderRadius: 4,
                border: `1px solid ${MUTED}33`,
              }}
            >
              REAL DATA
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: isMobile ? 11 : 12,
            color: MUTED,
            fontFamily: "monospace",
            marginLeft: 16,
          }}
        >
          Click any title card to highlight · All figures from real job postings
        </p>
      </div>

      {loading ? (
        <div style={{ margin: "20px 32px 0" }}>
          <Skeleton height={44} />
        </div>
      ) : (
        roles.length > 0 && (
          <RoleSelector
            role={activeRole}
            setRole={handleRoleSelection}
            roles={roles}
            isMobile={isMobile}
          />
        )
      )}

      {loading ? (
        <div style={{ margin: "20px 32px 0" }}>
          <Skeleton height={260} />
        </div>
      ) : (
        salaryData.length > 0 && (
          <SalaryByTitleChart salaryData={salaryData} isMobile={isMobile} />
        )
      )}

      {loading ? (
        <div style={{ margin: "20px 32px 0" }}>
          <Skeleton height={400} />
        </div>
      ) : (
        salaryData.length > 0 && (
          <Benchmarks
            salaryData={salaryData}
            selectedTitle={selectedTitle || salaryData[0]?.title}
            highlightedTitle={highlightedTitle}
            setSelectedTitle={setSelectedTitle}
            isMobile={isMobile}
          />
        )
      )}

      {loading ? (
        <div style={{ margin: "20px 32px 0" }}>
          <Skeleton height={120} />
        </div>
      ) : (
        <RemoteBreakdown remoteData={remoteData} isMobile={isMobile} />
      )}

      {loading ? (
        <div style={{ margin: "20px 32px 0" }}>
          <Skeleton height={200} />
        </div>
      ) : (
        <TopCountries countries={countries} isMobile={isMobile} />
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}
