import Image from "next/image";
import { Sidebar } from "@/components/sidebar";
import { getDashboardData } from "@/lib/dashboardData";
import { DashboardContent } from "@/components/dashboard-content";

export default async function Home() {
  const { dailyCallVolume, hourlyCallVolume, statCards, isLive } =
    await getDashboardData();

  return (
    <div className="h-screen overflow-hidden bg-pentridge-purple-darker text-pentridge-text">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="lg:hidden">
            <div className="flex items-center justify-between border-b border-pentridge-purple-medium bg-pentridge-purple-dark px-5 py-4">
              <Image
                src="/agentOS_logo.png"
                alt="Pentridge"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <div className="flex items-center gap-2 rounded-full bg-pentridge-purple-accent/10 px-4 py-2 text-xs font-medium text-pentridge-purple-accent">
                <span className="h-2 w-2 rounded-full bg-pentridge-purple-accent" aria-hidden />
                Connected to Airtable CRM
              </div>
            </div>
          </div>

          <DashboardContent
            statCards={statCards}
            dailyCallVolume={dailyCallVolume}
            hourlyCallVolume={hourlyCallVolume}
            isLive={isLive}
          />
        </div>
      </div>
    </div>
  );
}
