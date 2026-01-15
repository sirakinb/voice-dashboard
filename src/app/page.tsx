import Image from "next/image";
import { Sidebar } from "@/components/sidebar";
import { getDashboardData } from "@/lib/dashboardData";
import { DashboardContent } from "@/components/dashboard-content";

export default async function Home() {
  const { dailyCallVolume, hourlyCallVolume, statCards, isLive } =
    await getDashboardData();

  return (
    <div className="h-screen overflow-hidden bg-jackson-cream text-jackson-charcoal">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="lg:hidden">
            <div className="flex items-center justify-between border-b border-jackson-cream-dark bg-jackson-white px-5 py-4">
              <Image
                src="/jackson_logo.png"
                alt="Jackson Rental Homes"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <div className="flex items-center gap-2 rounded-full bg-jackson-green/10 px-4 py-2 text-xs font-medium text-jackson-green">
                <span className="h-2 w-2 rounded-full bg-jackson-green" aria-hidden />
                Connected to Zoho CRM
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
