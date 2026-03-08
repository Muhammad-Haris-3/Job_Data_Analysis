"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeContext";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const INDUSTRIES = ["ALL_INDUSTRIES", "FINTECH", "HEALTHCARE", "E-COMMERCE"];

const BADGE_ICONS = {
  HIGH_GROWTH: "↗",
  STABLE: "—",
  EXPLODING: "⚡",
  RISING: "↗",
};

function getSkillRowId(skillName) {
  const clean = (skillName || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `skill-${clean}`;
}

function findSkillByQuery(query, skillData) {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const exact = skillData.find((s) => s.skill.toLowerCase() === q);
  if (exact) return exact;

  const startsWith = skillData.find((s) => s.skill.toLowerCase().startsWith(q));
  if (startsWith) return startsWith;

  return skillData.find((s) => s.skill.toLowerCase().includes(q)) || null;
}

// Assign badge based on demand %
function getBadge(pct) {
  if (pct >= 50) return { badge: "HIGH_GROWTH", colorKey: "CYAN" };
  if (pct >= 30) return { badge: "RISING", colorKey: "ACCENT_GREEN" };
  if (pct >= 15) return { badge: "STABLE", colorKey: "MUTED" };
  return { badge: "EXPLODING", colorKey: "ACCENT_RED" };
}

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

// ── Search Bar ───────────────────────────────────────────────
function SearchBar({ query, setQuery, onSubmitSearch, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, TEXT, MUTED } = theme;
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmitSearch();
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="SEARCH SKILLS..."
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
          boxSizing: "border-box",
          transition: "border-color 0.25s ease",
        }}
      />
    </div>
  );
}

// ── Industry Filter ──────────────────────────────────────────
function IndustryButton({ ind, selected, setSelected }) {
  const { theme } = useTheme();
  const { CYAN, TEXT, MUTED, BORDER } = theme;
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
        transition: "all 0.25s ease",
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
function DemandCurve({ selectedSkill, skillData, isMobile }) {
  const { theme } = useTheme();
  const { CARD, BORDER, CYAN, MUTED, TEXT, ACCENT_GREEN } = theme;

  // Build chart data from real skill_trends
  const skill =
    skillData.find((s) => s.skill === selectedSkill) || skillData[0];
  const skillName = skill?.skill || selectedSkill;

  return (
    <div
      id="skill-demand-summary"
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
            {skillName.toUpperCase()}_DEMAND
          </div>
          <div
            style={{
              fontSize: 10,
              color: MUTED,
              marginTop: 2,
              fontFamily: "monospace",
            }}
          >
            % OF JOB POSTINGS REQUIRING THIS SKILL
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
            {skill?.pct ?? 0}%
          </div>
          <div style={{ fontSize: 11, color: ACCENT_GREEN, marginTop: 2 }}>
            of all postings
          </div>
        </div>
      </div>

      {/* Simple bar showing demand */}
      <div
        style={{
          marginTop: 16,
          height: 6,
          background: BORDER,
          borderRadius: 3,
        }}
      >
        <div
          style={{
            width: `${skill?.pct ?? 0}%`,
            height: "100%",
            borderRadius: 3,
            background: `linear-gradient(90deg, ${CYAN}88, ${CYAN})`,
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
        <span>0%</span>
        <span style={{ color: CYAN }}>{skill?.pct ?? 0}% demand</span>
        <span>100%</span>
      </div>

      {skill && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            background: `${CYAN}0a`,
            border: `1px solid ${CYAN}22`,
            borderRadius: 8,
            fontSize: 11,
            color: MUTED,
          }}
        >
          Found in{" "}
          <span style={{ color: CYAN, fontWeight: 700 }}>
            {skill.count.toLocaleString()}
          </span>{" "}
          job postings out of {skill.totalJobs?.toLocaleString() ?? "785,741"}{" "}
          total
        </div>
      )}
    </div>
  );
}

// ── Skill Row ────────────────────────────────────────────────
function SkillRow({
  skill,
  rank,
  isMobile,
  onClick,
  isSelected,
  isHighlighted,
}) {
  const { theme } = useTheme();
  const { CYAN, TEXT, MUTED, BORDER, SECONDARY_TEXT } = theme;
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const active = hovered || isSelected;
  const { badge, colorKey } = getBadge(skill.pct);
  const badgeColor = theme[colorKey];

  return (
    <div
      id={getSkillRowId(skill.skill)}
      className={`transition-all duration-300 ${isHighlighted ? "ring-2 ring-teal-400" : ""}`}
      onClick={() => onClick(skill.skill)}
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
        border: `1px solid ${
          isHighlighted ? "#2dd4bf" : isSelected ? CYAN + "44" : "transparent"
        }`,
        transition: "all 0.25s ease",
        boxShadow: isHighlighted ? "0 0 0 3px rgba(45, 212, 191, 0.2)" : "none",
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
        }}
      >
        {String(rank).padStart(2, "0")}
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
              color: active ? TEXT : SECONDARY_TEXT,
            }}
          >
            {skill.skill}
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
              width: `${Math.min(skill.pct, 100)}%`,
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
          background: `${badgeColor}18`,
          border: `1px solid ${badgeColor}44`,
          color: badgeColor,
          fontFamily: "monospace",
        }}
      >
        {BADGE_ICONS[badge]} {badge}
      </div>
    </div>
  );
}

// ── Ranked Skills ────────────────────────────────────────────
function RankedSkills({
  query,
  selectedSkill,
  highlightedSkill,
  setSelectedSkill,
  skillData,
  isMobile,
}) {
  const { theme } = useTheme();
  const { CARD, BORDER, TEXT, MUTED } = theme;

  const filtered = skillData.filter((s) =>
    s.skill.toLowerCase().includes(query.toLowerCase()),
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
          SORT: BY_DEMAND · REAL DATA
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
          No skills found for &quot;{query}&quot;
        </div>
      ) : (
        filtered.map((skill, i) => (
          <SkillRow
            key={skill.skill}
            skill={skill}
            rank={i + 1}
            isMobile={isMobile}
            onClick={setSelectedSkill}
            isSelected={selectedSkill === skill.skill}
            isHighlighted={highlightedSkill === skill.skill}
          />
        ))
      )}
    </div>
  );
}

// ── Optimal Skills Chart ─────────────────────────────────────
function OptimalSkills({ optimalData, isMobile }) {
  const { theme } = useTheme();
  const {
    CARD,
    BORDER,
    CYAN,
    MUTED,
    TEXT,
    TOOLTIP_BG,
    ACCENT_PURPLE,
    ACCENT_GREEN,
  } = theme;

  const chartData = optimalData.slice(0, 10).map((s) => ({
    name: s.skill,
    salary: Math.round(s.median_salary / 1000),
    demand: s.demand_pct,
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
          marginBottom: 4,
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
          OPTIMAL SKILLS
        </span>
        <span
          style={{
            fontSize: 10,
            color: MUTED,
            marginLeft: "auto",
            fontFamily: "monospace",
          }}
        >
          SALARY × DEMAND
        </span>
      </div>
      <p
        style={{
          fontSize: 11,
          color: MUTED,
          marginBottom: 14,
          fontFamily: "monospace",
        }}
      >
        Highest paying skills from real job postings
      </p>
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 20, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fill: MUTED, fontSize: isMobile ? 9 : 11 }}
            axisLine={false}
            tickLine={false}
            unit="k"
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: TEXT, fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            cursor={{ fill: `${CYAN}11` }}
            contentStyle={{
              background: TOOLTIP_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              fontSize: 11,
            }}
            formatter={(v, name) =>
              name === "salary"
                ? [`$${v}k`, "Median Salary"]
                : [`${v}%`, "Demand"]
            }
          />
          <Bar
            dataKey="salary"
            fill={ACCENT_GREEN}
            radius={[0, 4, 4, 0]}
            barSize={isMobile ? 10 : 14}
            name="salary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Insight Box ──────────────────────────────────────────────
function InsightBox({ skillData, optimalData, isMobile }) {
  const { theme } = useTheme();
  const { CYAN, SECONDARY_TEXT, ACCENT_GREEN, ACCENT_RED } = theme;

  const topSkill = skillData[0];
  const topPaying = optimalData[0];
  const fastestGrowing = skillData.find((s) => s.pct < 30 && s.pct > 10);

  return (
    <div
      style={{
        margin: isMobile ? "14px 14px 0" : "20px 32px 0",
        background: `linear-gradient(135deg, ${CYAN}0f, ${ACCENT_GREEN}08)`,
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
        📊 MARKET_INSIGHT · REAL DATA
      </div>
      <div
        style={{
          fontSize: isMobile ? 12 : 13,
          color: SECONDARY_TEXT,
          lineHeight: 1.6,
        }}
      >
        {topSkill && (
          <>
            <span style={{ color: CYAN, fontWeight: 700 }}>
              {topSkill.skill}
            </span>{" "}
            is the most demanded skill, appearing in{" "}
            <span style={{ color: CYAN, fontWeight: 700 }}>
              {topSkill.pct}%
            </span>{" "}
            of all job postings.{" "}
          </>
        )}
        {topPaying && (
          <>
            Highest paying skill is{" "}
            <span style={{ color: ACCENT_GREEN, fontWeight: 700 }}>
              {topPaying.skill}
            </span>{" "}
            with a median salary of{" "}
            <span style={{ color: ACCENT_GREEN, fontWeight: 700 }}>
              ${(topPaying.median_salary / 1000).toFixed(0)}k
            </span>
            .{" "}
          </>
        )}
        {fastestGrowing && (
          <>
            <span style={{ color: ACCENT_RED, fontWeight: 700 }}>
              {fastestGrowing.skill}
            </span>{" "}
            is an emerging skill worth learning for career growth.
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────
export default function SkillTracker({ isMobile, data, loading }) {
  const { theme } = useTheme();
  const { CYAN, TEXT, MUTED } = theme;
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("ALL_INDUSTRIES");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [highlightedSkill, setHighlightedSkill] = useState(null);
  const highlightTimeoutRef = useRef(null);

  // Build skill data from real API data
  const skillData = data
    ? data.top_skills.slice(0, 20).map((s) => ({
        skill: s.skill,
        pct: s.pct,
        count: s.count,
        totalJobs: data.meta.total_rows_processed,
      }))
    : [];

  const optimalData = data ? data.optimal_skills : [];

  const searchedSkill = findSkillByQuery(query, skillData);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const highlightSkillRow = (skillName) => {
    setHighlightedSkill(skillName);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedSkill(null);
    }, 2500);
  };

  const scrollToSummaryCard = () => {
    window.requestAnimationFrame(() => {
      const summary = document.getElementById("skill-demand-summary");
      if (summary) {
        summary.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const handleSearchSubmit = () => {
    const match = findSkillByQuery(query, skillData);
    if (!match) return;
    setSelectedSkill(match.skill);
    highlightSkillRow(match.skill);
    scrollToSummaryCard();
  };

  const handleSkillRowSelect = (skillName) => {
    setSelectedSkill(skillName);
    highlightSkillRow(skillName);
  };

  // Auto-select first skill
  const activeSkill =
    searchedSkill?.skill || selectedSkill || skillData[0]?.skill || "python";

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
            SKILL_TRACKER<span style={{ color: MUTED }}>.v2</span>
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
          Click any skill to see demand details ·{" "}
          {data
            ? `${data.meta.total_rows_processed.toLocaleString()} postings analyzed`
            : "Loading..."}
        </p>
      </div>

      <SearchBar
        query={query}
        setQuery={setQuery}
        onSubmitSearch={handleSearchSubmit}
        isMobile={isMobile}
      />
      <IndustryFilter
        selected={industry}
        setSelected={setIndustry}
        isMobile={isMobile}
      />

      {loading ? (
        <div style={{ margin: "20px 32px 0" }}>
          <Skeleton height={140} />
        </div>
      ) : (
        skillData.length > 0 && (
          <DemandCurve
            selectedSkill={activeSkill}
            skillData={skillData}
            isMobile={isMobile}
          />
        )
      )}

      {loading ? (
        <div style={{ margin: "20px 32px 0" }}>
          <Skeleton height={300} />
        </div>
      ) : (
        skillData.length > 0 && (
          <RankedSkills
            query={query}
            selectedSkill={activeSkill}
            highlightedSkill={highlightedSkill}
            setSelectedSkill={handleSkillRowSelect}
            skillData={skillData}
            isMobile={isMobile}
          />
        )
      )}

      {loading ? (
        <div style={{ margin: "20px 32px 0" }}>
          <Skeleton height={280} />
        </div>
      ) : (
        optimalData.length > 0 && (
          <OptimalSkills optimalData={optimalData} isMobile={isMobile} />
        )
      )}

      {!loading && skillData.length > 0 && optimalData.length > 0 && (
        <InsightBox
          skillData={skillData}
          optimalData={optimalData}
          isMobile={isMobile}
        />
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}
