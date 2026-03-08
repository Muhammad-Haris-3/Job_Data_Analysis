"use client";

import { useState, useEffect } from "react";
import { useTheme, ThemeProvider } from "./ThemeContext";
import SkillTracker from "./SkillTracker";
import SalaryMap from "./SalaryMap";
import AnalyzeData from "./AnalyzeData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Hover Hook ───────────────────────────────────────────────
function useHover() {
  const [hovered, setHovered] = useState(false);
  return {
    hovered,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
}

// ── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  const { theme } = useTheme();
  const { BORDER, TEXT, MUTED, TOOLTIP_BG, CYAN, ACCENT_GREEN, ACCENT_YELLOW } =
    theme;
  if (!active || !payload?.length) return null;

  const values = payload.reduce((acc, p) => {
    if (p?.dataKey) acc[p.dataKey] = p.value;
    return acc;
  }, {});

  const rows = [
    { key: "avg", label: "Avg", color: CYAN },
    { key: "max", label: "Max", color: ACCENT_GREEN },
    { key: "min", label: "Min", color: ACCENT_YELLOW },
  ].filter((row) => values[row.key] !== undefined && values[row.key] !== null);

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
      <div style={{ color: MUTED, marginBottom: 4 }}>{label}</div>
      {rows.map((row) => (
        <div key={row.key} style={{ color: row.color }}>
          {row.label}: <strong>${values[row.key]}k</strong>
        </div>
      ))}
    </div>
  );
};

// ── Loading Skeleton ─────────────────────────────────────────
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
        animation: "shimmer 1.5s infinite",
        ...style,
      }}
    />
  );
}

// ── Error Banner ─────────────────────────────────────────────
function ErrorBanner({ message }) {
  const { theme } = useTheme();
  return (
    <div
      style={{
        margin: "12px 32px",
        padding: "12px 16px",
        background: `${theme.RED}15`,
        border: `1px solid ${theme.RED}44`,
        borderRadius: 10,
        color: theme.RED,
        fontSize: 13,
        fontFamily: "monospace",
      }}
    >
      ⚠ API Error: {message} — make sure Flask is running on localhost:5000
    </div>
  );
}

// ── Summary Card (single) ────────────────────────────────────
function SummaryCard({ s, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, MUTED, TEXT, CARD_HOVER } = theme;
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: hovered ? CARD_HOVER : CARD,
        border: `1px solid ${hovered ? s.colorKey + "66" : BORDER}`,
        borderRadius: isMobile ? 12 : 14,
        padding: isMobile ? "12px 14px" : "20px 22px",
        cursor: "default",
        transition:
          "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        boxShadow: hovered ? `0 0 16px ${s.colorKey}0f` : "none",
      }}
    >
      <div
        style={{
          fontSize: isMobile ? 9 : 10,
          color: MUTED,
          letterSpacing: 1,
          marginBottom: 4,
        }}
      >
        {s.label}
      </div>
      <div
        style={{
          fontSize: isMobile ? 26 : 32,
          fontWeight: 800,
          color: TEXT,
          lineHeight: 1,
        }}
      >
        {s.value}
      </div>
      <div style={{ marginTop: 6 }}>
        <span
          style={{
            fontSize: isMobile ? 11 : 13,
            color: s.colorKey,
            fontWeight: 600,
          }}
        >
          ↗ {s.change}
        </span>
      </div>
      <div
        style={{
          marginTop: 8,
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${s.colorKey}55, ${s.colorKey})`,
          transform: hovered ? "scaleX(1.03)" : "scaleX(1)",
          transition: "transform 0.2s ease",
          transformOrigin: "left",
        }}
      />
    </div>
  );
}

// ── Summary Cards ────────────────────────────────────────────
function SummaryCards({ data, loading, isMobile }) {
  const { theme } = useTheme();
  const {
    CARD,
    BORDER,
    MUTED,
    TEXT,
    CARD_HOVER,
    CYAN,
    ACCENT_GREEN,
    ACCENT_PURPLE,
    ACCENT_YELLOW,
  } = theme;

  const cards = data
    ? [
        {
          label: "TOTAL POSTINGS",
          value: `${(data.summary_stats.total_jobs / 1000).toFixed(1)}k`,
          change: data.summary_stats.market_growth,
          colorKey: CYAN,
        },
        {
          label: "AVG SALARY",
          value: `$${(data.summary_stats.avg_salary / 1000).toFixed(0)}k`,
          change: "+real data",
          colorKey: ACCENT_GREEN,
        },
        {
          label: "COMPANIES",
          value: `${(data.summary_stats.active_companies / 1000).toFixed(1)}k`,
          change: "+active",
          colorKey: ACCENT_PURPLE,
        },
        {
          label: "MARKET GROWTH",
          value: data.summary_stats.market_growth,
          change: "YoY",
          colorKey: ACCENT_YELLOW,
        },
      ]
    : [];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
        gap: isMobile ? 10 : 16,
        padding: isMobile ? "14px 14px 0" : "24px 32px 0",
      }}
    >
      {loading
        ? Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "20px 22px",
                }}
              >
                <Skeleton
                  height={10}
                  width="60%"
                  style={{ marginBottom: 12 }}
                />
                <Skeleton height={32} width="80%" style={{ marginBottom: 8 }} />
                <Skeleton height={10} width="40%" />
              </div>
            ))
        : cards.map((s) => (
            <SummaryCard key={s.label} s={s} isMobile={isMobile} />
          ))}
    </div>
  );
}

// ── Role Row (single) ────────────────────────────────────────
function RoleRow({ r, isMobile }) {
  const { theme } = useTheme();
  const { CYAN, TEXT, BORDER, SECONDARY_TEXT } = theme;
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        marginBottom: 12,
        padding: "6px 8px",
        borderRadius: 8,
        background: hovered ? `${CYAN}08` : "transparent",
        transition: "background 0.2s ease",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span
          style={{
            fontSize: isMobile ? 13 : 14,
            color: hovered ? TEXT : SECONDARY_TEXT,
          }}
        >
          {r.title}
        </span>
        <span
          style={{ fontSize: isMobile ? 11 : 12, color: CYAN, fontWeight: 600 }}
        >
          {r.count.toLocaleString()} jobs
        </span>
      </div>
      <div style={{ height: 4, background: BORDER, borderRadius: 2 }}>
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            width: `${r.pct}%`,
            background: `linear-gradient(90deg, ${CYAN}88, ${CYAN})`,
            opacity: hovered ? 1 : 0.7,
            transition: "opacity 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── Top Roles ────────────────────────────────────────────────
function TopRoles({ data, loading, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, TEXT } = theme;

  const roles = data
    ? data.top_titles.slice(0, 6).map((t) => ({
        title: t.title,
        pct: Math.round((t.count / data.top_titles[0].count) * 100),
        count: t.count,
      }))
    : [];

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
          TOP JOB TITLES
        </span>
        {data && (
          <span
            style={{
              fontSize: 10,
              color: theme.MUTED,
              marginLeft: "auto",
              fontFamily: "monospace",
            }}
          >
            REAL DATA · {data.meta.total_rows_processed.toLocaleString()}{" "}
            POSTINGS
          </span>
        )}
      </div>
      {loading ? (
        Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} height={44} style={{ marginBottom: 10 }} />
          ))
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 0 : "0 32px",
          }}
        >
          {roles.map((r) => (
            <RoleRow key={r.title} r={r} isMobile={isMobile} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Range Button ─────────────────────────────────────────────
function RangeButton({ r, range, setRange, isMobile }) {
  const { theme } = useTheme();
  const { CYAN, MUTED, BORDER } = theme;
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const isActive = range === r;
  return (
    <button
      onClick={() => setRange(r)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        padding: "3px 10px",
        borderRadius: 6,
        fontSize: isMobile ? 11 : 12,
        fontWeight: 700,
        border: `1px solid ${isActive ? CYAN : hovered ? CYAN + "88" : BORDER}`,
        background: isActive
          ? `${CYAN}22`
          : hovered
            ? `${CYAN}11`
            : "transparent",
        color: isActive ? CYAN : hovered ? CYAN + "cc" : MUTED,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {r}
    </button>
  );
}

// ── Stat Box ─────────────────────────────────────────────────
function StatBox({ label, val, clr, isMobile }) {
  const { theme } = useTheme();
  const { CARD_HOVER, SUBTLE_BG, BORDER, MUTED } = theme;
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: hovered ? CARD_HOVER : SUBTLE_BG,
        borderRadius: 8,
        padding: isMobile ? "8px 10px" : "12px 16px",
        textAlign: "center",
        border: `1px solid ${hovered ? clr + "55" : BORDER}`,
        transition: "all 0.25s ease",
        cursor: "default",
      }}
    >
      <div
        style={{ fontSize: isMobile ? 9 : 10, color: MUTED, letterSpacing: 1 }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: isMobile ? 18 : 24,
          fontWeight: 800,
          color: clr,
          marginTop: 2,
        }}
      >
        {val}
      </div>
    </div>
  );
}

// ── Salary Trends ────────────────────────────────────────────
function SalaryTrends({ data, loading, range, setRange, isMobile }) {
  const { theme } = useTheme();
  const {
    CARD,
    BORDER,
    CYAN,
    MUTED,
    TEXT,
    SUBTLE_BG,
    CARD_HOVER,
    ACCENT_GREEN,
    ACCENT_YELLOW,
  } = theme;

  // Use real salary trends, filter by range
  const rawTrends = data?.salary_trends || [];
  const chartData =
    range === "6M"
      ? rawTrends.slice(-6) // 6 months
      : rawTrends; // all data

  // Convert raw salary to $k and format label
  const formatted = chartData.map((d) => ({
    ...d,
    label: d.month.slice(0, 7),
    avg: Math.round((d.avg ?? 0) / 1000),
    max: Math.round((d.max ?? d.avg ?? 0) / 1000),
    min: Math.round((d.min ?? d.avg ?? 0) / 1000),
  }));

  const maxSalary = data ? Math.max(...rawTrends.map((d) => d.max)) : 0;
  const minSalary = data ? Math.min(...rawTrends.map((d) => d.min)) : 0;

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
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: ACCENT_GREEN,
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
            SALARY TRENDS
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["6M", "ALL"].map((r) => (
            <RangeButton
              key={r}
              r={r}
              range={range}
              setRange={setRange}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton height={220} />
      ) : (
        <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
          <AreaChart
            data={formatted}
            margin={{ top: 4, right: 30, left: 20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT_GREEN} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ACCENT_GREEN} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT_YELLOW} stopOpacity={0.2} />
                <stop offset="95%" stopColor={ACCENT_YELLOW} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={BORDER}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: MUTED, fontSize: isMobile ? 9 : 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: MUTED, fontSize: isMobile ? 9 : 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}k`}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="avg"
              name="Avg"
              stroke={CYAN}
              strokeWidth={2}
              fill="url(#cyanGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="max"
              name="Max"
              stroke={ACCENT_GREEN}
              strokeWidth={2}
              strokeDasharray="4 3"
              fill="url(#greenGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="min"
              name="Min"
              stroke={ACCENT_YELLOW}
              strokeWidth={2}
              strokeDasharray="2 2"
              fill="url(#yellowGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {data && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 10,
          }}
        >
          <StatBox
            label="MAX OFFER"
            val={`$${(maxSalary / 1000).toFixed(0)}k`}
            clr={CYAN}
            isMobile={isMobile}
          />
          <StatBox
            label="MIN OFFER"
            val={`$${(minSalary / 1000).toFixed(0)}k`}
            clr={ACCENT_YELLOW}
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
}

// ── Skills Bar ───────────────────────────────────────────────
function SkillsBar({ data, loading, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, MUTED, TEXT, TOOLTIP_BG, ACCENT_PURPLE } = theme;

  const skills = data
    ? data.top_skills.slice(0, 8).map((s) => ({ name: s.skill, value: s.pct }))
    : [];

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
          TOP SKILLS IN DEMAND
        </span>
        {data && (
          <span
            style={{
              fontSize: 10,
              color: MUTED,
              marginLeft: "auto",
              fontFamily: "monospace",
            }}
          >
            % OF JOB POSTINGS
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton height={180} />
      ) : (
        <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
          <BarChart
            data={skills}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[0, Math.ceil(skills[0]?.value || 100)]}
              tick={{ fill: MUTED, fontSize: isMobile ? 9 : 11 }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: TEXT, fontSize: isMobile ? 11 : 13 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              cursor={{ fill: `${CYAN}11` }}
              contentStyle={{
                background: TOOLTIP_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(v) => [`${v}%`, "Demand"]}
            />
            <Bar
              dataKey="value"
              fill={CYAN}
              radius={[0, 4, 4, 0]}
              barSize={isMobile ? 10 : 14}
              name="Demand %"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Bottom Nav (mobile) ──────────────────────────────────────
function BottomNav({ active, setActive }) {
  const { theme } = useTheme();
  const { BORDER, CARD, CYAN, TEXT, MUTED } = theme;
  const items = [
    { id: "DASH", icon: "⊞", label: "DASH" },
    { id: "MARKET", icon: "📈", label: "MARKET" },
    { id: "JOBS", icon: "💼", label: "JOBS" },
    { id: "SETTINGS", icon: "⚙️", label: "DATA" },
  ];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 14px",
        borderTop: `1px solid ${BORDER}`,
        background: CARD,
      }}
    >
      {items.map((it) => {
        const { hovered, onMouseEnter, onMouseLeave } = useHover();
        return (
          <button
            key={it.id}
            onClick={() => setActive(it.id)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              transform: hovered ? "scale(1.15)" : "scale(1)",
              transition: "transform 0.15s ease",
            }}
          >
            <span style={{ fontSize: 18 }}>{it.icon}</span>
            <span
              style={{
                fontSize: 9,
                letterSpacing: 1,
                fontWeight: 700,
                color: active === it.id ? CYAN : hovered ? TEXT : MUTED,
                transition: "color 0.15s ease",
              }}
            >
              {it.label}
            </span>
            {active === it.id && (
              <div
                style={{
                  width: 16,
                  height: 2,
                  borderRadius: 1,
                  background: CYAN,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Nav Button ───────────────────────────────────────────────
function NavButton({ item, isActive, onClick }) {
  const { theme } = useTheme();
  const { CYAN, TEXT, MUTED } = theme;
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: isActive ? `${CYAN}15` : hovered ? `${CYAN}08` : "none",
        border: "none",
        borderBottom: `2px solid ${isActive ? CYAN : "transparent"}`,
        cursor: "pointer",
        padding: "6px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderRadius: "6px 6px 0 0",
        transition: "all 0.25s ease",
      }}
    >
      <span style={{ fontSize: 14 }}>{item.icon}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.5,
          color: isActive ? CYAN : hovered ? TEXT : MUTED,
          transition: "color 0.15s ease",
        }}
      >
        {item.label}
      </span>
    </button>
  );
}

// ── Header ───────────────────────────────────────────────────
function Header({ time, isMobile, active, setActive, dataReady }) {
  const { dark, setDark, theme } = useTheme();
  const { CYAN, TEXT, BORDER, MUTED, ACCENT_GREEN } = theme;
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const navItems = [
    { id: "DASH", icon: "⊞", label: "Dashboard" },
    { id: "MARKET", icon: "📈", label: "Skill Trends" },
    { id: "JOBS", icon: "💼", label: "Salary Map" },
    { id: "SETTINGS", icon: "🔬", label: "Analyze Data" },
  ];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: isMobile ? "14px 16px 10px" : "16px 32px 14px",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            background: CYAN,
            borderRadius: 6,
            padding: isMobile ? "4px 7px" : "6px 10px",
            fontSize: isMobile ? 13 : 16,
            fontWeight: 800,
            color: "#000",
            fontFamily: "monospace",
          }}
        >
          ▶
        </div>
        <span
          style={{
            color: CYAN,
            fontWeight: 800,
            fontSize: isMobile ? 16 : 20,
            letterSpacing: 1,
          }}
        >
          JOBMARKET<span style={{ color: TEXT }}>.AI</span>
        </span>
        {/* Live data indicator */}
        {dataReady && !isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginLeft: 8,
              padding: "3px 10px",
              borderRadius: 20,
              background: `${ACCENT_GREEN}15`,
              border: `1px solid ${ACCENT_GREEN}33`,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: ACCENT_GREEN,
                boxShadow: `0 0 6px ${ACCENT_GREEN}`,
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: ACCENT_GREEN,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              LIVE DATA
            </span>
          </div>
        )}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginLeft: 6,
            }}
          >
            {navItems.map((it) => (
              <NavButton
                key={it.id}
                item={it}
                isActive={active === it.id}
                onClick={() => setActive(it.id)}
              />
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: isMobile ? 9 : 10,
              color: MUTED,
              letterSpacing: 1,
            }}
          >
            SYSTEM LIVE
          </div>
          <div
            style={{
              fontSize: isMobile ? 13 : 15,
              color: TEXT,
              fontFamily: "monospace",
            }}
          >
            {time}
          </div>
        </div>
        <button
          onClick={() => setDark(!dark)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{
            background: hovered ? `${CYAN}22` : BORDER,
            border: `1px solid ${hovered ? CYAN + "55" : "transparent"}`,
            borderRadius: "50%",
            width: isMobile ? 32 : 38,
            height: isMobile ? 32 : 38,
            cursor: "pointer",
            fontSize: isMobile ? 15 : 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.25s ease",
          }}
        >
          {dark ? "🌙" : "☀️"}
        </button>
      </div>
    </div>
  );
}

// ── Page Content ─────────────────────────────────────────────
function PageContent({
  active,
  isMobile,
  range,
  setRange,
  data,
  loading,
  error,
}) {
  switch (active) {
    case "MARKET":
      return <SkillTracker isMobile={isMobile} data={data} loading={loading} />;
    case "JOBS":
      return <SalaryMap isMobile={isMobile} data={data} loading={loading} />;
    case "SETTINGS":
      return <AnalyzeData isMobile={isMobile} />;
    case "DASH":
    default:
      return (
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            paddingBottom: isMobile ? 4 : 32,
          }}
        >
          {error && <ErrorBanner message={error} />}
          <SummaryCards data={data} loading={loading} isMobile={isMobile} />
          <TopRoles data={data} loading={loading} isMobile={isMobile} />
          <SalaryTrends
            data={data}
            loading={loading}
            range={range}
            setRange={setRange}
            isMobile={isMobile}
          />
          <SkillsBar data={data} loading={loading} isMobile={isMobile} />
          <div style={{ height: 8 }} />
        </div>
      );
  }
}

// ── Main ─────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardInner />
    </ThemeProvider>
  );
}

function DashboardInner() {
  const { theme } = useTheme();
  const { BG } = theme;
  const [time, setTime] = useState("");
  const [range, setRange] = useState("ALL");
  const [active, setActive] = useState("DASH");
  const [isMobile, setIsMobile] = useState(false);

  // ── Real data state ──
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API}/api/all`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const layout = {
    width: "100%",
    height: "100vh",
    background: BG,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  };

  if (isMobile) {
    return (
      <div style={layout}>
        <Header
          time={time}
          isMobile={true}
          active={active}
          setActive={setActive}
          dataReady={!!data}
        />
        <PageContent
          active={active}
          isMobile={true}
          range={range}
          setRange={setRange}
          data={data}
          loading={loading}
          error={error}
        />
        <BottomNav active={active} setActive={setActive} />
      </div>
    );
  }

  return (
    <div style={layout}>
      <Header
        time={time}
        isMobile={false}
        active={active}
        setActive={setActive}
        dataReady={!!data}
      />
      <PageContent
        active={active}
        isMobile={false}
        range={range}
        setRange={setRange}
        data={data}
        loading={loading}
        error={error}
      />
    </div>
  );
}
