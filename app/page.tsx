// page.tsx — replace your current app/page.tsx with this
import SummaryCards from "../components/SummaryCards";
import JobMarketCharts from "../components/JobMarketCharts";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto py-8">
      {/* Page Header */}
      <div className="px-6 mb-7">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{
              color: "#00d4ff",
              background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.2)",
              fontFamily: "monospace",
            }}
          >
            MARKET OVERVIEW
          </span>
        </div>
        <h2 className="text-2xl font-bold" style={{ color: "#e2e8f0" }}>
          Data Science Job Market
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "#4a6fa5", fontFamily: "monospace" }}
        >
          Real-time insights · lukebarousse/data_jobs dataset
        </p>
      </div>

      <SummaryCards />

      <div className="mt-6">
        <JobMarketCharts />
      </div>
    </main>
  );
}
