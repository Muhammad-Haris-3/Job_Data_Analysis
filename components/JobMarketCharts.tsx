"use strict";
"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts";
import { Loader2, TrendingUp, BarChart2 } from "lucide-react";
import {
  fetchMarketTrends,
  SkillData,
  SalaryTrendData,
} from "../services/marketService";

const GRID_COLOR = "#1e3a5f";
const TICK_COLOR = "#4a6fa5";

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0d1424",
          border: "1px solid #00d4ff33",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: "monospace",
          boxShadow: "0 0 20px rgba(0,212,255,0.1)",
        }}
      >
        <p style={{ color: "#4a6fa5", fontSize: 11, marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ color: "#00d4ff", fontSize: 16, fontWeight: 700 }}>
          {payload[0].value.toLocaleString()}
          <span style={{ fontSize: 11, color: "#4a6fa5", marginLeft: 4 }}>
            postings
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0d1424",
          border: "1px solid #1e3a5f",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: "monospace",
        }}
      >
        <p style={{ color: "#4a6fa5", fontSize: 11, marginBottom: 6 }}>
          {label}
        </p>
        {payload.map((p: any) => (
          <p
            key={p.name}
            style={{ color: p.color, fontSize: 13, fontWeight: 600 }}
          >
            {p.name}:{" "}
            {typeof p.value === "number" && p.name.includes("Salary")
              ? `$${p.value.toLocaleString()}`
              : p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard = ({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ElementType;
  accent: string;
  children: React.ReactNode;
}) => (
  <div
    className="rounded-xl overflow-hidden"
    style={{
      background: "linear-gradient(135deg, #0d1424 0%, #0a0e1a 100%)",
      border: "1px solid #1e3a5f",
    }}
  >
    <div
      className="flex items-center gap-2 px-5 py-4"
      style={{ borderBottom: "1px solid #1e3a5f" }}
    >
      <div className="p-1.5 rounded-md" style={{ background: `${accent}15` }}>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <h3
        className="text-sm font-semibold uppercase tracking-widest"
        style={{ color: "#8ba3c7", fontFamily: "monospace" }}
      >
        {title}
      </h3>
      <div className="ml-auto flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span
          className="text-xs"
          style={{ color: "#4a6fa5", fontFamily: "monospace" }}
        >
          LIVE
        </span>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const JobMarketCharts = () => {
  const [skillsData, setSkillsData] = useState<SkillData[]>([]);
  const [salaryData, setSalaryData] = useState<SalaryTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trends = await fetchMarketTrends();
        setSkillsData(trends.topSkills);
        setSalaryData(trends.salaryTrends);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "#00d4ff" }}
        />
        <span
          className="ml-2 text-sm"
          style={{ color: "#4a6fa5", fontFamily: "monospace" }}
        >
          FETCHING_CHARTS...
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-6 pb-6">
      {/* Horizontal Bar Chart — Top Job Titles */}
      <ChartCard title="Top Job Titles" icon={BarChart2} accent="#00d4ff">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={skillsData}
              margin={{ top: 0, right: 50, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke={GRID_COLOR}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: TICK_COLOR,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#8ba3c7",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                width={110}
                tickFormatter={(v) =>
                  v.length > 14 ? `${v.substring(0, 14)}…` : v
                }
              />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={{ fill: "rgba(0,212,255,0.04)" }}
              />
              <Bar
                dataKey="value"
                radius={[0, 3, 3, 0]}
                barSize={22}
                name="Count"
                fill="url(#barGradientH)"
              />
              <defs>
                <linearGradient id="barGradientH" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.9} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Line Chart — Salary Trends */}
      <ChartCard title="Salary Trends" icon={TrendingUp} accent="#00ff88">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salaryData}
              margin={{ top: 5, right: 10, left: 15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={GRID_COLOR}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: TICK_COLOR,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                dy={8}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: TICK_COLOR,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: TICK_COLOR,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: 16,
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: TICK_COLOR,
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgSalary"
                name="Avg Salary ($)"
                stroke="#00ff88"
                strokeWidth={2.5}
                dot={{ fill: "#00ff88", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#00ff88", strokeWidth: 0 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="postings"
                name="Job Postings"
                stroke="#a78bfa"
                strokeWidth={2.5}
                dot={{ fill: "#a78bfa", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};

export default JobMarketCharts;
