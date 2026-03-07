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

// ── Dummy Data ──────────────────────────────────────────────
const SUMMARY = [
  { label: "TOTAL POSTINGS", value: "24.5k", change: "+12%", colorKey: "CYAN" },
  {
    label: "AVG SALARY",
    value: "$142k",
    change: "+5%",
    colorKey: "ACCENT_GREEN",
  },
  {
    label: "COMPANIES",
    value: "1.2k",
    change: "+2%",
    colorKey: "ACCENT_PURPLE",
  },
  {
    label: "GROWTH",
    value: "8.4%",
    change: "+1.5%",
    colorKey: "ACCENT_YELLOW",
  },
];

const TOP_ROLES = [
  { title: "Data Scientist", pct: 92 },
  { title: "ML Engineer", pct: 85 },
  { title: "Data Analyst", pct: 78 },
  { title: "AI Researcher", pct: 64 },
  { title: "Data Engineer", pct: 57 },
];

const SALARY_TREND = [
  { month: "JAN", avg: 95, max: 160, min: 70 },
  { month: "FEB", avg: 98, max: 168, min: 72 },
  { month: "MAR", avg: 94, max: 162, min: 68 },
  { month: "APR", avg: 105, max: 178, min: 75 },
  { month: "MAY", avg: 118, max: 195, min: 82 },
  { month: "JUN", avg: 130, max: 210, min: 85 },
];

const TOP_SKILLS = [
  { name: "Python", value: 84 },
  { name: "SQL", value: 72 },
  { name: "AWS", value: 64 },
  { name: "PyTorch", value: 58 },
  { name: "Docker", value: 51 },
];

const pct = (v) => `${v}%`;

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
  const { BORDER, TEXT, MUTED, TOOLTIP_BG } = theme;
  if (!active || !payload?.length) return null;
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
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <strong>${p.value}k</strong>
        </div>
      ))}
    </div>
  );
};

// ── Summary Card (individual with hover) ────────────────────
function SummaryCard({ s, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, MUTED, TEXT, CARD_HOVER } = theme;
  const color = theme[s.colorKey];
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: hovered ? CARD_HOVER : CARD,
        border: `1px solid ${hovered ? color + "66" : BORDER}`,
        borderRadius: isMobile ? 12 : 14,
        padding: isMobile ? "12px 14px" : "20px 22px",
        cursor: "default",
        transition:
          "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        boxShadow: hovered ? `0 0 16px ${color}0f` : "none",
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
            color: color,
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
          background: `linear-gradient(90deg, ${color}55, ${color})`,
          transform: hovered ? "scaleX(1.03)" : "scaleX(1)",
          transition: "transform 0.2s ease",
          transformOrigin: "left",
        }}
      />
    </div>
  );
}

// ── Summary Cards Grid ───────────────────────────────────────
function SummaryCards({ isMobile }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
        gap: isMobile ? 10 : 16,
        padding: isMobile ? "14px 14px 0" : "24px 32px 0",
      }}
    >
      {SUMMARY.map((s) => (
        <SummaryCard key={s.label} s={s} isMobile={isMobile} />
      ))}
    </div>
  );
}

// ── Top Roles ────────────────────────────────────────────────
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
          {r.pct}% Match
        </span>
      </div>
      <div style={{ height: 4, background: BORDER, borderRadius: 2 }}>
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            width: pct(r.pct),
            background: `linear-gradient(90deg, ${CYAN}88, ${CYAN})`,
            transition: "opacity 0.2s ease",
            opacity: hovered ? 1 : 0.7,
          }}
        />
      </div>
    </div>
  );
}

function TopRoles({ isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, TEXT } = theme;
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
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 0 : "0 32px",
        }}
      >
        {TOP_ROLES.map((r) => (
          <RoleRow key={r.title} r={r} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
}

// ── Salary Trends ────────────────────────────────────────────
function SalaryTrends({ range, setRange, isMobile }) {
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
          {["1M", "1Y"].map((r) => {
            const { hovered, onMouseEnter, onMouseLeave } = useHover();
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 700,
                  border: `1px solid ${range === r ? CYAN : hovered ? CYAN + "88" : BORDER}`,
                  background:
                    range === r
                      ? `${CYAN}22`
                      : hovered
                        ? `${CYAN}11`
                        : "transparent",
                  color: range === r ? CYAN : hovered ? CYAN + "cc" : MUTED,
                  cursor: "pointer",
                  transition:
                    "background 0.25s ease, border-color 0.25s ease, color 0.25s ease",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
        <AreaChart
          data={SALARY_TREND}
          margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
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
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={BORDER}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: MUTED, fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
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
        </AreaChart>
      </ResponsiveContainer>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginTop: 10,
        }}
      >
        {[
          ["MAX OFFER", "$210k", CYAN],
          ["MIN OFFER", "$85k", ACCENT_YELLOW],
        ].map(([lbl, val, clr]) => {
          const { hovered, onMouseEnter, onMouseLeave } = useHover();
          return (
            <div
              key={lbl}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              style={{
                background: hovered ? CARD_HOVER : SUBTLE_BG,
                borderRadius: 8,
                padding: isMobile ? "8px 10px" : "12px 16px",
                textAlign: "center",
                border: `1px solid ${hovered ? clr + "55" : BORDER}`,
                transition: "background 0.25s ease, border-color 0.25s ease",
                cursor: "default",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? 9 : 10,
                  color: MUTED,
                  letterSpacing: 1,
                }}
              >
                {lbl}
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
        })}
      </div>
    </div>
  );
}

// ── Skills Bar ───────────────────────────────────────────────
function SkillsBar({ isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, MUTED, TEXT, TOOLTIP_BG, ACCENT_PURPLE } = theme;
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
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 130 : 180}>
        <BarChart
          data={TOP_SKILLS}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: MUTED, fontSize: isMobile ? 9 : 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: TEXT, fontSize: isMobile ? 11 : 13 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            cursor={{ fill: `${CYAN}11` }}
            contentStyle={{
              background: TOOLTIP_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              fontSize: 11,
            }}
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
    { id: "SETTINGS", icon: "⚙️", label: "SETTINGS" },
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

// ── Nav Button (for top header) ──────────────────────────────
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
        transition: "background 0.25s ease, border-color 0.25s ease",
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
function Header({ time, isMobile, active, setActive }) {
  const { dark, setDark, theme } = useTheme();
  const { CYAN, TEXT, BORDER, MUTED } = theme;
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const navItems = [
    { id: "DASH", icon: "⊞", label: "Dashboard" },
    { id: "MARKET", icon: "📈", label: "Market" },
    { id: "JOBS", icon: "💼", label: "Jobs" },
    { id: "SETTINGS", icon: "⚙️", label: "Settings" },
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
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginLeft: 6,
            }}
          >
            {navItems.map((it) => {
              const isActive = active === it.id;
              return (
                <NavButton
                  key={it.id}
                  item={it}
                  isActive={isActive}
                  onClick={() => setActive(it.id)}
                />
              );
            })}
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
            transition: "background 0.25s ease, border-color 0.25s ease",
          }}
        >
          {dark ? "🌙" : "☀️"}
        </button>
      </div>
    </div>
  );
}

function PageContent({ active, isMobile, range, setRange }) {
  switch (active) {
    case "MARKET":
      return <SkillTracker isMobile={isMobile} />;
    case "JOBS":
      return <SalaryMap isMobile={isMobile} />;
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
          <SummaryCards isMobile={isMobile} />
          <TopRoles isMobile={isMobile} />
          <SalaryTrends range={range} setRange={setRange} isMobile={isMobile} />
          <SkillsBar isMobile={isMobile} />
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
  const [range, setRange] = useState("1M");
  const [active, setActive] = useState("DASH");
  const [isMobile, setIsMobile] = useState(false);

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

  if (isMobile) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          background: BG,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
      >
        <Header
          time={time}
          isMobile={true}
          active={active}
          setActive={setActive}
        />
        <PageContent
          active={active}
          isMobile={true}
          range={range}
          setRange={setRange}
        />
        <BottomNav active={active} setActive={setActive} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: BG,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <Header
        time={time}
        isMobile={false}
        active={active}
        setActive={setActive}
      />
      <PageContent
        active={active}
        isMobile={isMobile}
        range={range}
        setRange={setRange}
      />
    </div>
  );
}
