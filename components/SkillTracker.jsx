"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Dummy Data ──────────────────────────────────────────────
const SKILLS = [
  {
    rank: "01",
    name: "Python",
    pct: 84,
    badge: "HIGH_GROWTH",
    badgeColor: "#00e5ff",
  },
  { rank: "02", name: "SQL", pct: 72, badge: "STABLE", badgeColor: "#4a6080" },
  {
    rank: "03",
    name: "PyTorch",
    pct: 68,
    badge: "EXPLODING",
    badgeColor: "#ff6b6b",
  },
  { rank: "04", name: "AWS", pct: 64, badge: "RISING", badgeColor: "#00e676" },
  {
    rank: "05",
    name: "Docker",
    pct: 59,
    badge: "STABLE",
    badgeColor: "#4a6080",
  },
  {
    rank: "06",
    name: "TensorFlow",
    pct: 55,
    badge: "RISING",
    badgeColor: "#00e676",
  },
  {
    rank: "07",
    name: "Spark",
    pct: 48,
    badge: "STABLE",
    badgeColor: "#4a6080",
  },
];

const INDUSTRIES = ["ALL_INDUSTRIES", "FINTECH", "HEALTHCARE", "E-COMMERCE"];

const DEMAND_CURVE = [
  { month: "JAN '23", value: 58 },
  { month: "APR", value: 62 },
  { month: "JUL", value: 60 },
  { month: "OCT", value: 68 },
  { month: "JAN '24", value: 75 },
  { month: "APR", value: 78 },
  { month: "JUL", value: 76 },
  { month: "OCT", value: 82 },
  { month: "JAN '25", value: 84 },
];

const BADGE_ICONS = {
  HIGH_GROWTH: "↗",
  STABLE: "—",
  EXPLODING: "⚡",
  RISING: "↗",
};

// ── Palette ─────────────────────────────────────────────────
const CARD = "#0e1623";
const BORDER = "#1a2535";
const CYAN = "#00e5ff";
const MUTED = "#4a6080";
const TEXT = "#e2eaf4";

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
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#111d2e",
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        color: TEXT,
      }}
    >
      <div style={{ color: MUTED, marginBottom: 4 }}>{label}</div>
      <div style={{ color: CYAN }}>
        Demand: <strong>{payload[0].value}%</strong>
      </div>
    </div>
  );
};

// ── Search Bar ───────────────────────────────────────────────
function SearchBar({ query, setQuery, isMobile }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        margin: isMobile ? "14px 14px 0" : "20px 32px 0",
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: MUTED,
          fontSize: 14,
        }}
      >
        🔍
      </span>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="QUERY_SKILLS_DATABASE..."
        style={{
          width: "100%",
          background: CARD,
          border: `1px solid ${focused ? CYAN + "88" : BORDER}`,
          borderRadius: 10,
          padding: "10px 14px 10px 38px",
          color: TEXT,
          fontSize: isMobile ? 12 : 13,
          fontFamily: "'JetBrains Mono', monospace",
          outline: "none",
          boxShadow: focused ? `0 0 12px ${CYAN}22` : "none",
          transition: "all 0.2s ease",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ── Industry Filter ──────────────────────────────────────────
function IndustryButton({ ind, selected, setSelected }) {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const isActive = selected === ind;
  return (
    <button
      onClick={() => setSelected(ind)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        padding: "5px 12px",
        borderRadius: 8,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
        fontFamily: "'JetBrains Mono', monospace",
        border: `1px solid ${isActive ? CYAN : hovered ? CYAN + "55" : BORDER}`,
        background: isActive
          ? `${CYAN}22`
          : hovered
            ? `${CYAN}0f`
            : "transparent",
        color: isActive ? CYAN : hovered ? TEXT : MUTED,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {ind}
    </button>
  );
}

function IndustryFilter({ selected, setSelected, isMobile }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        margin: isMobile ? "10px 14px 0" : "12px 32px 0",
      }}
    >
      {INDUSTRIES.map((ind) => (
        <IndustryButton
          key={ind}
          ind={ind}
          selected={selected}
          setSelected={setSelected}
        />
      ))}
    </div>
  );
}

// ── Demand Curve ─────────────────────────────────────────────
function DemandCurve({ selectedSkill, isMobile }) {
  const skill = SKILLS.find((s) => s.name === selectedSkill) || SKILLS[0];
  const chartData = DEMAND_CURVE.map((d) => ({
    ...d,
    value: Math.round(d.value * (skill.pct / 84)),
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
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <div>
          <div
            style={{
              fontSize: isMobile ? 11 : 12,
              color: CYAN,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {skill.name.toUpperCase()}_DEMAND_CURVE
          </div>
          <div
            style={{
              fontSize: 10,
              color: MUTED,
              marginTop: 2,
              fontFamily: "monospace",
            }}
          >
            INTERVAL: 24_MONTHS
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: isMobile ? 26 : 32,
              fontWeight: 800,
              color: TEXT,
            }}
          >
            {skill.pct}%
          </div>
          <div style={{ fontSize: 11, color: "#00e676", marginTop: 2 }}>
            +12.4% YoY
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 100 : 140}>
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 0, left: -28, bottom: 0 }}
        >
          <defs>
            <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={BORDER}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: MUTED, fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CYAN}
            strokeWidth={2}
            fill="url(#demandGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Skill Row ────────────────────────────────────────────────
function SkillRow({ skill, isMobile, onClick, isSelected }) {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const active = hovered || isSelected;
  return (
    <div
      onClick={() => onClick(skill.name)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 10 : 16,
        padding: isMobile ? "10px 8px" : "12px 12px",
        borderRadius: 10,
        cursor: "pointer",
        background: isSelected
          ? `${CYAN}12`
          : hovered
            ? `${CYAN}08`
            : "transparent",
        border: `1px solid ${isSelected ? CYAN + "44" : "transparent"}`,
        transition: "all 0.15s ease",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          fontSize: isMobile ? 11 : 12,
          color: active ? CYAN : MUTED,
          fontWeight: 700,
          width: 24,
          flexShrink: 0,
          transition: "color 0.15s ease",
        }}
      >
        {skill.rank}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 5,
          }}
        >
          <span
            style={{
              fontSize: isMobile ? 13 : 14,
              fontWeight: 700,
              color: active ? TEXT : "#b0bec5",
              transition: "color 0.15s ease",
            }}
          >
            {skill.name}
          </span>
          <span style={{ fontSize: isMobile ? 11 : 12, color: MUTED }}>
            {skill.pct}%
          </span>
        </div>
        <div style={{ height: 4, background: BORDER, borderRadius: 2 }}>
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              width: `${skill.pct}%`,
              background: `linear-gradient(90deg, ${CYAN}88, ${CYAN})`,
              opacity: active ? 1 : 0.6,
              transition: "opacity 0.15s ease",
            }}
          />
        </div>
      </div>

      <div
        style={{
          fontSize: isMobile ? 9 : 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          flexShrink: 0,
          padding: "3px 8px",
          borderRadius: 6,
          background: `${skill.badgeColor}18`,
          border: `1px solid ${skill.badgeColor}44`,
          color: skill.badgeColor,
          fontFamily: "monospace",
        }}
      >
        {BADGE_ICONS[skill.badge]} {skill.badge}
      </div>
    </div>
  );
}

// ── Ranked Skills ────────────────────────────────────────────
function RankedSkills({ query, selectedSkill, setSelectedSkill, isMobile }) {
  const filtered = SKILLS.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );
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
        <span
          style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: 1,
          }}
        >
          RANKED_SKILLS
        </span>
        <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
          SORT: BY_DEMAND
        </span>
      </div>
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: MUTED,
            fontSize: 13,
            padding: "20px 0",
          }}
        >
          No skills found for "{query}"
        </div>
      ) : (
        filtered.map((skill) => (
          <SkillRow
            key={skill.name}
            skill={skill}
            isMobile={isMobile}
            onClick={setSelectedSkill}
            isSelected={selectedSkill === skill.name}
          />
        ))
      )}
    </div>
  );
}

// ── Insight Box ──────────────────────────────────────────────
function InsightBox({ isMobile }) {
  return (
    <div
      style={{
        margin: isMobile ? "14px 14px 0" : "20px 32px 0",
        background: `linear-gradient(135deg, ${CYAN}0f, #00e67608)`,
        border: `1px solid ${CYAN}33`,
        borderRadius: isMobile ? 12 : 14,
        padding: isMobile ? "14px" : "22px",
      }}
    >
      <div
        style={{
          fontSize: isMobile ? 12 : 13,
          fontWeight: 700,
          color: CYAN,
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        📊 MARKET_INSIGHT
      </div>
      <div
        style={{
          fontSize: isMobile ? 12 : 13,
          color: "#b0bec5",
          lineHeight: 1.6,
        }}
      >
        Python demand grew{" "}
        <span style={{ color: CYAN, fontWeight: 700 }}>+12.4% YoY</span> —
        highest among all tracked skills. PyTorch is the fastest-rising
        framework with{" "}
        <span style={{ color: "#ff6b6b", fontWeight: 700 }}>3× growth</span>{" "}
        since 2023. Cloud skills (AWS, GCP) now appear in{" "}
        <span style={{ color: "#00e676", fontWeight: 700 }}>64%</span> of senior
        DS postings.
      </div>
    </div>
  );
}

// ── Main Export (content only, no layout wrapper) ────────────
export default function SkillTracker({ isMobile }) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("ALL_INDUSTRIES");
  const [selectedSkill, setSelectedSkill] = useState("Python");

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
              background: CYAN,
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
            SKILL_TRACKER<span style={{ color: MUTED }}>.v1</span>
          </span>
        </div>
        <p
          style={{
            fontSize: isMobile ? 11 : 12,
            color: MUTED,
            fontFamily: "monospace",
            marginLeft: 16,
          }}
        >
          Click any skill to update the demand curve
        </p>
      </div>

      <SearchBar query={query} setQuery={setQuery} isMobile={isMobile} />
      <IndustryFilter
        selected={industry}
        setSelected={setIndustry}
        isMobile={isMobile}
      />
      <DemandCurve selectedSkill={selectedSkill} isMobile={isMobile} />
      <RankedSkills
        query={query}
        selectedSkill={selectedSkill}
        setSelectedSkill={setSelectedSkill}
        isMobile={isMobile}
      />
      <InsightBox isMobile={isMobile} />
      <div style={{ height: 16 }} />
    </div>
  );
}
