"use client";

import { CallVolumePanel } from "@/components/call-volume-panel";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatCard } from "@/components/stat-card";
import { useDemoMode } from "@/lib/demo-context";
import { demoCallVolumeData } from "@/lib/demo-data";
import type { CallVolumeDatum, StatCard as StatCardType } from "@/lib/mockData";

type Props = {
    statCards: StatCardType[];
    dailyCallVolume: CallVolumeDatum[];
    hourlyCallVolume: CallVolumeDatum[];
    isLive: boolean;
};

export function DashboardContent({
    statCards,
    dailyCallVolume,
    hourlyCallVolume,
    isLive,
}: Props) {
    const { isDemoMode } = useDemoMode();

    // Use demo data if in demo mode
    const displayStatCards = isDemoMode
        ? [
            { label: "Total Daily Calls", value: "127", change: 14.2 },
            { label: "% of Calls AI Could Handle", value: "95%", change: 3.1 },
            { label: "Callbacks Required", value: "5%", change: -2.3 },
        ]
        : statCards;

    const displayDailyVolume = isDemoMode
        ? demoCallVolumeData.map((d) => ({
            day: d.date,
            isoDate: d.date,
            totalCalls: d.totalCalls,
            aiHandled: d.aiHandled,
        }))
        : dailyCallVolume;

    const displayHourlyVolume = isDemoMode ? [] : hourlyCallVolume;

    const showDemoWarning = isDemoMode;
    const showSupabaseWarning = !isDemoMode && !isLive;

    return (
        <main className="flex-1 space-y-6 overflow-y-auto px-5 py-6 lg:px-10">
            <DashboardHeader
                title="Jackson Rental Homes Voice Dashboard"
                subtitle="Monitor leasing calls and resident support handled by the AI receptionist."
                connectionLabel="Connected to Zoho CRM"
            />

            {showDemoWarning && (
                <div className="rounded-xl border border-jackson-green/30 bg-jackson-green/10 px-4 py-3 text-sm text-jackson-green">
                    <div className="flex items-center gap-2">
                        <svg
                            className="h-4 w-4 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        <span>
                            Demo Mode Active - Showing sample data for demonstration purposes.
                            Toggle off in the sidebar to view live data.
                        </span>
                    </div>
                </div>
            )}

            {showSupabaseWarning && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    Showing sample data. Add your Supabase credentials in{" "}
                    <code className="mx-1 rounded bg-jackson-charcoal/10 px-1 py-0.5 font-mono text-xs">
                        .env.local
                    </code>{" "}
                    to load live call analytics.
                </div>
            )}

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {displayStatCards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </section>

            <section className="rounded-2xl border border-jackson-cream-dark bg-jackson-white p-6 shadow-sm">
                <CallVolumePanel
                    dailyData={displayDailyVolume}
                    hourlyData={displayHourlyVolume}
                />
            </section>
        </main>
    );
}
