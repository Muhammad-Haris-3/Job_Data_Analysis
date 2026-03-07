"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ── Dummy Data ──────────────────────────────────────────────
const CITIES = [
  {
    city: "San Francisco, CA",
    short: "SF",
    min: 165,
    median: 192,
    max: 240,
    yoy: "+12%",
    yoyColor: "#00e676",
    currency: "$",
    flag: "🇺🇸",
  },
  {
    city: "New York City, NY",
    short: "NYC",
    min: 150,
    median: 178,
    max: 215,
    yoy: "+8%",
    yoyColor: "#00e676",
    currency: "$",
    flag: "🇺🇸",
  },
  {
    city: "London, UK",
    short: "LDN",
    min: 85,
    median: 95,
    max: 130,
    yoy: "+4%",
    yoyColor: "#ffd54f",
    currency: "£",
    flag: "🇬🇧",
  },
  {
    city: "Bangalore, IN",
    short: "BLR",
    min: 48,
    median: 62,
    max: 95,
    yoy: "+18%",
    yoyColor: "#00e676",
    currency: "$",
    flag: "🇮🇳",
  },
  {
    city: "Berlin, DE",
    short: "BER",
    min: 70,
    median: 88,
    max: 120,
    yoy: "+6%",
    yoyColor: "#00e676",
    currency: "€",
    flag: "🇩🇪",
  },
  {
    city: "Toronto, CA",
    short: "TOR",
    min: 90,
    median: 112,
    max: 155,
    yoy: "+9%",
    yoyColor: "#00e676",
    currency: "$",
    flag: "🇨🇦",
  },
];

const ROLES = [
  "Senior Data Scientist",
  "ML Engineer",
  "Data Analyst",
  "Data Engineer",
  "AI Researcher",
];

const CHART_DATA = CITIES.map((c) => ({
  name: c.short,
  min: c.min,
  median: c.median,
  max: c.max,
  flag: c.flag,
}));

const COL_DATA = [
  { city: "SF", salary: 192, col: 95, ratio: 2.0 },
  { city: "NYC", salary: 178, col: 85, ratio: 2.1 },
  { city: "LDN", salary: 95, col: 70, ratio: 1.36 },
  { city: "BLR", salary: 62, col: 18, ratio: 3.4 },
  { city: "BER", salary: 88, col: 55, ratio: 1.6 },
  { city: "TOR", salary: 112, col: 65, ratio: 1.7 },
];

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
      <div style={{ color: MUTED, marginBottom: 6, fontWeight: 700 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>${p.value}k</strong>
        </div>
      ))}
    </div>
  );
};

// ── Role Selector ────────────────────────────────────────────
function RoleSelector({ role, setRole, isMobile }) {
  return (
    <div style={{ margin: isMobile ? "14px 14px 0" : "20px 32px 0" }}>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{
          width: "100%",
          background: CARD,
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
        {ROLES.map((r) => (
          <option key={r} value={r} style={{ background: "#0e1623" }}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Salary Bar Chart ─────────────────────────────────────────
function SalaryChart({ isMobile }) {
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
          SALARY COMPARISON
        </span>
        <span
          style={{
            fontSize: 10,
            color: MUTED,
            marginLeft: "auto",
            fontFamily: "monospace",
          }}
        >
          GLOBAL DATA · USD
        </span>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        {[
          ["Min", "#4a6080"],
          ["Median", CYAN],
          ["Max", "#00e676"],
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
      <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
        <BarChart
          data={CHART_DATA}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          barGap={2}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={BORDER}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: MUTED, fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
            unit="k"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: `${CYAN}08` }} />
          <Bar
            dataKey="min"
            name="Min"
            fill="#4a6080"
            radius={[3, 3, 0, 0]}
            barSize={isMobile ? 8 : 14}
          />
          <Bar
            dataKey="median"
            name="Median"
            fill={CYAN}
            radius={[3, 3, 0, 0]}
            barSize={isMobile ? 8 : 14}
          />
          <Bar
            dataKey="max"
            name="Max"
            fill="#00e676"
            radius={[3, 3, 0, 0]}
            barSize={isMobile ? 8 : 14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── City Benchmark Card ──────────────────────────────────────
function CityCard({ c, isMobile, isSelected, onClick }) {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const active = hovered || isSelected;
  return (
    <div
      onClick={() => onClick(c.city)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: isSelected ? `${CYAN}10` : hovered ? `${CYAN}08` : CARD,
        border: `1px solid ${isSelected ? CYAN + "55" : hovered ? CYAN + "33" : BORDER}`,
        borderRadius: isMobile ? 10 : 12,
        padding: isMobile ? "12px" : "16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: isSelected ? `0 0 12px ${CYAN}18` : "none",
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
            {c.flag} {c.city.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: isMobile ? 18 : 22,
              fontWeight: 800,
              color: active ? TEXT : "#b0bec5",
            }}
          >
            {c.currency}
            {c.min}k – {c.currency}
            {c.max}k
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 6,
            background: `${c.yoyColor}18`,
            border: `1px solid ${c.yoyColor}44`,
            color: c.yoyColor,
          }}
        >
          {c.yoy} YoY
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
            left: `${(c.min / c.max) * 100}%`,
            width: `${((c.median - c.min) / c.max) * 100}%`,
            height: "100%",
            background: CYAN,
            borderRadius: 2,
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${(c.median / c.max) * 100}%`,
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
        <span>
          25th ({c.currency}
          {c.min}k)
        </span>
        <span style={{ color: CYAN }}>
          Median ({c.currency}
          {c.median}k)
        </span>
        <span>
          75th ({c.currency}
          {c.max}k)
        </span>
      </div>
    </div>
  );
}

// ── Benchmarks Grid ──────────────────────────────────────────
function Benchmarks({ selectedCity, setSelectedCity, isMobile }) {
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
              background: "#ffd54f",
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
            MARKET BENCHMARKS
          </span>
        </div>
        <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
          GLOBAL DATA
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 10 : 14,
        }}
      >
        {CITIES.map((c) => (
          <CityCard
            key={c.city}
            c={c}
            isMobile={isMobile}
            isSelected={selectedCity === c.city}
            onClick={setSelectedCity}
          />
        ))}
      </div>
    </div>
  );
}

// ── Cost of Living vs Salary ─────────────────────────────────
function CostOfLiving({ isMobile }) {
  const maxSalary = Math.max(...COL_DATA.map((d) => d.salary));
  const maxCol = Math.max(...COL_DATA.map((d) => d.col));

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
            background: "#ce93d8",
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
          COST OF LIVING vs SALARY
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
        Adjusted for purchasing power parity (PPP)
      </p>

      {COL_DATA.map((d) => (
        <div key={d.city} style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, color: TEXT, fontWeight: 700 }}>
              {d.city}
            </span>
            <span style={{ fontSize: 11, color: CYAN }}>{d.ratio}x ratio</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: MUTED, width: 48 }}>
                Salary
              </span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: BORDER,
                  borderRadius: 3,
                }}
              >
                <div
                  style={{
                    width: `${(d.salary / maxSalary) * 100}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${CYAN}88, ${CYAN})`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: MUTED,
                  width: 36,
                  textAlign: "right",
                }}
              >
                ${d.salary}k
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: MUTED, width: 48 }}>CoL</span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: BORDER,
                  borderRadius: 3,
                }}
              >
                <div
                  style={{
                    width: `${(d.col / maxSalary) * 100}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: `linear-gradient(90deg, #ff6b6b88, #ff6b6b)`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: MUTED,
                  width: 36,
                  textAlign: "right",
                }}
              >
                ${d.col}k
              </span>
            </div>
          </div>
        </div>
      ))}

      <div
        style={{
          marginTop: 14,
          padding: "10px 14px",
          background: `${CYAN}0a`,
          border: `1px solid ${CYAN}22`,
          borderRadius: 8,
          fontSize: 11,
          color: "#b0bec5",
          lineHeight: 1.6,
        }}
      >
        💡 Bangalore currently offers the highest effective disposable income
        relative to cost of living among all tracked cities.
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────
export default function SalaryMap({ isMobile }) {
  const [role, setRole] = useState("Senior Data Scientist");
  const [selectedCity, setSelectedCity] = useState("San Francisco, CA");

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
              background: "#ffd54f",
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
        </div>
        <p
          style={{
            fontSize: isMobile ? 11 : 12,
            color: MUTED,
            fontFamily: "monospace",
            marginLeft: 16,
          }}
        >
          Click any city card to highlight · All figures in USD equivalent
        </p>
      </div>

      <RoleSelector role={role} setRole={setRole} isMobile={isMobile} />
      <SalaryChart isMobile={isMobile} />
      <Benchmarks
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        isMobile={isMobile}
      />
      <CostOfLiving isMobile={isMobile} />
      <div style={{ height: 16 }} />
    </div>
  );
}
