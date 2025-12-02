import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { PerformanceReport } from "@/components/performance-report";

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-pentridge-purple-darker">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <DashboardHeader
            title="Performance Report"
            subtitle="Weekly AI voice agent performance analysis and insights."
            connectionLabel="Connected to Airtable CRM"
          />
          <div className="mt-8">
            <PerformanceReport />
          </div>
        </main>
      </div>
    </div>
  );
}

