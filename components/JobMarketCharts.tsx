"use strict";
"use client";
import React, { useEffect, useState } from 'react';
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
  Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { fetchMarketTrends, SkillData, SalaryTrendData } from '../services/marketService';

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
         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
       </div>
     );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pt-0">
      {/* Top Job Titles Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Top Job Titles</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
                name="Count"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Salary Trends Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Salary Trends Overview</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salaryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgSalary" 
                name="Avg Salary ($)"
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="postings" 
                name="Job Postings"
                stroke="#6366F1" 
                strokeWidth={3}
                dot={{ fill: '#6366F1', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default JobMarketCharts;
