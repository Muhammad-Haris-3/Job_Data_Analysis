export interface JobData {
  totalJobs: string;
  avgSalary: string;
  activeCompanies: string;
  marketGrowth: string;
}

export interface SkillData {
  name: string;
  value: number;
}

export interface SalaryTrendData {
  month: string;
  avgSalary: number;
  postings: number;
}

export interface MarketTrends {
  summary: JobData;
  topSkills: SkillData[];
  salaryTrends: SalaryTrendData[];
}

const MOCK_DATA: MarketTrends = {
  summary: {
    totalJobs: "1,245",
    avgSalary: "$112,500",
    activeCompanies: "328",
    marketGrowth: "8.4%"
  },
  topSkills: [
    { name: 'Python', value: 850 },
    { name: 'SQL', value: 720 },
    { name: 'React', value: 650 },
    { name: 'Node.js', value: 580 },
    { name: 'AWS', value: 520 },
    { name: 'Java', value: 480 },
  ],
  salaryTrends: [
    { month: 'Jan', avgSalary: 95000, postings: 120 },
    { month: 'Feb', avgSalary: 98000, postings: 145 },
    { month: 'Mar', avgSalary: 102000, postings: 160 },
    { month: 'Apr', avgSalary: 105000, postings: 190 },
    { month: 'May', avgSalary: 108000, postings: 210 },
    { month: 'Jun', avgSalary: 112000, postings: 240 },
  ]
};

export const fetchMarketTrends = async (): Promise<MarketTrends> => {
  // Simulate API delay for other data
  await new Promise(resolve => setTimeout(resolve, 500));

  const USE_MOCK_DATA = false; 

  if (USE_MOCK_DATA) {
    return MOCK_DATA;
  }

  // Real API implementation
  try {
    const response = await fetch('http://localhost:5000/api/trends');
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    
    // Map backend snake_case to frontend camelCase
    return {
      summary: {
        totalJobs: data.summary_stats.total_jobs.toLocaleString(),
        avgSalary: `$${data.summary_stats.average_salary.toLocaleString()}`,
        activeCompanies: data.summary_stats.active_companies.toLocaleString(),
        marketGrowth: data.summary_stats.market_growth
      },
      topSkills: data.top_skills_chart,
      salaryTrends: MOCK_DATA.salaryTrends // Still using mock for salary trends as backend doesn't provide it yet
    };
  } catch (error) {
    console.error("API call failed, falling back to mock data:", error);
    return MOCK_DATA;
  }
};
