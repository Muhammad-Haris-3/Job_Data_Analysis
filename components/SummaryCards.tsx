"use strict";
"use client";
import React, { useEffect, useState } from 'react';
import { Briefcase, TrendingUp, Users, DollarSign, Activity, Loader2 } from 'lucide-react';
import { fetchMarketTrends, JobData } from '../services/marketService';

const SummaryCards = () => {
  const [data, setData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trends = await fetchMarketTrends();
        setData(trends.summary);
      } catch (error) {
        console.error("Failed to fetch market trends:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Total Job Postings",
      value: data.totalJobs,
      change: "+12.5%",
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      label: "Average Salary",
      value: data.avgSalary,
      change: "+5.2%",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      label: "Active Companies",
      value: data.activeCompanies,
      change: "+3.1%",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
    {
      label: "Market Growth",
      value: data.marketGrowth,
      change: "+1.2%",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{stat.change}</span>
            <span className="text-slate-400 ml-1">from last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
