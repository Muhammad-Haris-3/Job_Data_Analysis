import SummaryCards from "../components/SummaryCards";
import JobMarketCharts from "../components/JobMarketCharts";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto py-8">
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500 mt-1">Real-time insights into the data science job market.</p>
      </div>

      <SummaryCards />
      
      <div className="mt-8">
        <JobMarketCharts />
      </div>
    </main>
  );
}
