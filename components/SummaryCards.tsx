"use strict";
"use client";
import React, { useEffect, useState } from "react";
import {
  Briefcase,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
} from "lucide-react";
import { fetchMarketTrends, JobData } from "../services/marketService";

const cardConfig = [
  {
    key: "totalJobs" as keyof JobData,
    label: "Total Postings",
    icon: Briefcase,
    accent: "#00d4ff",
    bg: "rgba(0, 212, 255, 0.06)",
    border: "rgba(0, 212, 255, 0.2)",
    tag: "LIVE",
  },
  {
    key: "avgSalary" as keyof JobData,
    label: "Avg. Salary / yr",
    icon: DollarSign,
    accent: "#00ff88",
    bg: "rgba(0, 255, 136, 0.06)",
    border: "rgba(0, 255, 136, 0.2)",
    tag: "USD",
  },
  {
    key: "activeCompanies" as keyof JobData,
    label: "Active Companies",
    icon: Users,
    accent: "#a78bfa",
    bg: "rgba(167, 139, 250, 0.06)",
    border: "rgba(167, 139, 250, 0.2)",
    tag: "HIRING",
  },
  {
    key: "marketGrowth" as keyof JobData,
    label: "Market Growth",
    icon: TrendingUp,
    accent: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.06)",
    border: "rgba(251, 191, 36, 0.2)",
    tag: "YoY",
  },
];

const SummaryCards = () => {
  const [data, setData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trends = await fetchMarketTrends();
        setData(trends.summary);
      } catch (error) {
        console.error("Failed to fetch market trends:", error);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 50);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "#00d4ff" }}
        />
        <span
          className="ml-2 text-sm"
          style={{ color: "#4a6fa5", fontFamily: "monospace" }}
        >
          LOADING_DATASET...
        </span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
      {cardConfig.map(
        ({ key, label, icon: Icon, accent, bg, border, tag }, index) => (
          <div
            key={key}
            className="relative overflow-hidden rounded-xl p-5 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, #0d1424 0%, #0a0e1a 100%)`,
              border: `1px solid ${border}`,
              boxShadow: `0 0 20px ${accent}0a`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 0.4s ease ${index * 80}ms, transform 0.4s ease ${index * 80}ms, box-shadow 0.2s ease`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 0 30px ${accent}22`;
              (e.currentTarget as HTMLElement).style.borderColor = accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 0 20px ${accent}0a`;
              (e.currentTarget as HTMLElement).style.borderColor = border;
            }}
          >
            {/* Top glow line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent}66, transparent)`,
              }}
            />

            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  color: accent,
                  background: bg,
                  fontFamily: "monospace",
                  letterSpacing: "0.08em",
                }}
              >
                {tag}
              </span>
            </div>

            <div className="mt-2">
              <p
                className="text-xs font-medium uppercase tracking-widest mb-1"
                style={{ color: "#4a6fa5", fontFamily: "monospace" }}
              >
                {label}
              </p>
              <h3
                className="text-2xl font-bold"
                style={{ color: "#e2e8f0", fontFamily: "monospace" }}
              >
                {data[key]}
              </h3>
            </div>

            {/* Bottom bar */}
            <div
              className="mt-4 h-1 rounded-full"
              style={{ background: "#1e3a5f" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: "65%",
                  background: `linear-gradient(90deg, ${accent}44, ${accent})`,
                }}
              />
            </div>
          </div>
        ),
      )}
    </div>
  );
};

export default SummaryCards;
