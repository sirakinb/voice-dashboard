import Image from "next/image";
import { CallVolumePanel } from "@/components/call-volume-panel";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
import { getDashboardData } from "@/lib/dashboardData";

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

          <main className="flex-1 space-y-6 overflow-y-auto px-5 py-6 lg:px-10">
            <DashboardHeader
              title="Jackson Rental Homes Voice Dashboard"
              subtitle="Monitor leasing calls and resident support handled by the AI receptionist."
              connectionLabel="Connected to Zoho CRM"
            />

            {!isLive ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Showing sample data. Add your Supabase credentials in{" "}
                <code className="mx-1 rounded bg-jackson-charcoal/10 px-1 py-0.5 font-mono text-xs">
                  .env.local
                </code>{" "}
                to load live call analytics.
              </div>
            ) : null}

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </section>

            <section className="rounded-2xl border border-jackson-cream-dark bg-jackson-white p-6 shadow-sm">
              <CallVolumePanel
                dailyData={dailyCallVolume}
                hourlyData={hourlyCallVolume}
              />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
