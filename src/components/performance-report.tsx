"use client";

import { useEffect, useState, useCallback } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { generateReportInsights, type ReportInsights } from "@/lib/gemini";
import { useDemoMode } from "@/lib/demo-context";
import { demoReportData, demoAIInsights } from "@/lib/demo-data";

// Types for the report data
type CategoryBreakdown = {
  category: string;
  count: number;
  percentage: number;
};

type DayOfWeekData = {
  day: string;
  dayNumber: number;
  total: number;
  avg: number;
};

type WeekOption = {
  weekStart: string;
  weekEnd: string;
  label: string;
};

type ReportData = {
  periodStart: string;
  periodEnd: string;
  totalDays: number;
  totalCalls: number;
  avgDailyCalls: number;
  afterHoursCalls: number;
  afterHoursPercentage: number;
  peakDay: {
    date: string;
    calls: number;
  };
  categoryBreakdown: CategoryBreakdown[];
  dayOfWeekBreakdown: DayOfWeekData[];
};

export function PerformanceReport() {
  const { isDemoMode } = useDemoMode();
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeekOption | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [aiInsights, setAiInsights] = useState<ReportInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available weeks on mount
  useEffect(() => {
    async function fetchWeeks() {
      // Use demo data if in demo mode
      if (isDemoMode) {
        const demoWeeks = [
          {
            weekStart: demoReportData.periodStart,
            weekEnd: demoReportData.periodEnd,
            label: `${new Date(demoReportData.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(demoReportData.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
          },
        ];
        setAvailableWeeks(demoWeeks);
        setSelectedWeek(demoWeeks[0]);
        setLoading(false);
        return;
      }

      try {
        const supabase = supabaseBrowserClient();
        const { data, error } = await supabase.rpc("get_available_report_weeks");

        if (error) throw error;

        const weeks = data || [];
        setAvailableWeeks(weeks);

        if (weeks.length > 0) {
          setSelectedWeek(weeks[0]);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error fetching weeks:", errorMessage);
        setError(`Failed to load available report periods: ${errorMessage}`);
      }
    }

    fetchWeeks();
  }, [isDemoMode]);

  // Generate AI insights
  const generateInsights = useCallback(async (data: ReportData) => {
    setAiLoading(true);
    try {
      const insights = await generateReportInsights({
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        totalCalls: data.totalCalls,
        avgDailyCalls: data.avgDailyCalls,
        afterHoursCalls: data.afterHoursCalls,
        afterHoursPercentage: data.afterHoursPercentage,
        peakDay: data.peakDay,
        categoryBreakdown: data.categoryBreakdown,
        dayOfWeekBreakdown: data.dayOfWeekBreakdown,
      });
      setAiInsights(insights);
    } catch (err) {
      console.error("Error generating AI insights:", err);
      // Fallback handled in gemini.ts
    } finally {
      setAiLoading(false);
    }
  }, []);

  // Fetch report when selected week changes
  useEffect(() => {
    if (!selectedWeek) {
      setLoading(false);
      return;
    }

    async function fetchReport() {
      if (!selectedWeek) return;

      setLoading(true);
      setError(null);
      setAiInsights(null);

      // Use demo data if in demo mode
      if (isDemoMode) {
        setReport(demoReportData);
        setAiInsights(demoAIInsights);
        setLoading(false);
        return;
      }

      try {
        const supabase = supabaseBrowserClient();
        const { data, error } = await supabase.rpc("get_weekly_report", {
          p_start_date: selectedWeek.weekStart,
          p_end_date: selectedWeek.weekEnd,
        });

        if (error) throw error;

        setReport(data);

        // Generate AI insights after getting the data
        if (data && data.totalCalls > 0) {
          generateInsights(data);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("Error fetching report:", errorMessage);
        setError(`Failed to load report data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [selectedWeek, generateInsights, isDemoMode]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-jackson-charcoal-muted">Loading report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-900/30 bg-rose-900/20 p-6 text-center">
        <p className="text-rose-400">{error}</p>
        <p className="mt-2 text-sm text-rose-300">
          Make sure you&apos;ve run the SQL schema in Supabase.
        </p>
      </div>
    );
  }

  if (!report || availableWeeks.length === 0) {
    return (
      <div className="rounded-2xl border border-jackson-cream-dark bg-jackson-white p-8 text-center">
        <p className="text-jackson-charcoal-muted">
          No call data available yet. Reports will appear here once calls are
          recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label
            htmlFor="week-select"
            className="text-sm font-medium text-jackson-charcoal"
          >
            Report Period:
          </label>
          <select
            id="week-select"
            value={selectedWeek?.weekStart || ""}
            onChange={(e) => {
              const week = availableWeeks.find(
                (w) => w.weekStart === e.target.value
              );
              if (week) setSelectedWeek(week);
            }}
            className="rounded-lg border border-jackson-cream-dark bg-jackson-white px-4 py-2 text-sm font-medium text-jackson-charcoal shadow-sm focus:border-jackson-green focus:outline-none focus:ring-1 focus:ring-jackson-green"
          >
            {availableWeeks.map((week) => (
              <option key={week.weekStart} value={week.weekStart}>
                {week.label}
              </option>
            ))}
          </select>
        </div>
        {aiLoading && (
          <div className="flex items-center gap-2 text-sm text-jackson-green">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating AI insights...
          </div>
        )}
      </div>

      {/* At-A-Glance Metrics */}
      <section className="rounded-2xl border border-jackson-cream-dark bg-jackson-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-jackson-charcoal">
          At-A-Glance Performance
        </h2>
        <p className="mt-1 text-sm text-jackson-charcoal-muted">
          {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            label="Total Calls"
            value={report.totalCalls.toLocaleString()}
            subtitle="this week"
          />
          <MetricCard
            label="Daily Average"
            value={report.avgDailyCalls?.toFixed(1) || "0"}
            subtitle="calls/day"
          />
          <MetricCard
            label="Peak Day"
            value={report.peakDay?.calls?.toLocaleString() || "0"}
            subtitle={
              report.peakDay?.date ? formatDate(report.peakDay.date) : "N/A"
            }
          />
          <MetricCard
            label="After-Hours"
            value={report.afterHoursCalls?.toLocaleString() || "0"}
            subtitle={`${report.afterHoursPercentage || 0}% of total`}
          />
          <MetricCard
            label="Qualified Leads"
            value={Math.round(
              (report.afterHoursCalls || 0) * 0.7
            ).toLocaleString()}
            subtitle="after-hours"
          />
        </div>
      </section>

      {/* AI Executive Summary */}
      <section className="rounded-2xl border border-jackson-cream-dark bg-jackson-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-jackson-charcoal">
            Executive Summary
          </h2>
          <span className="rounded-full bg-jackson-green/10 px-2 py-0.5 text-xs font-medium text-jackson-green">
            AI Generated
          </span>
        </div>
        {aiLoading ? (
          <div className="mt-4 h-16 animate-pulse rounded-lg bg-jackson-cream-dark" />
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-jackson-charcoal">
            {aiInsights?.executiveSummary ||
              `Your AI voice agent handled ${report.totalCalls.toLocaleString()} calls this week.`}
          </p>
        )}
      </section>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <section className="rounded-2xl border border-jackson-cream-dark bg-jackson-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-jackson-charcoal">
            Call Categories
          </h2>
          <p className="mt-1 text-sm text-jackson-charcoal-muted">
            What callers are asking about
          </p>

          <div className="mt-4 space-y-3">
            {report.categoryBreakdown?.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-jackson-charcoal">
                    {cat.category}
                  </span>
                  <span className="text-jackson-charcoal-muted">
                    {cat.count} ({cat.percentage}%)
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-jackson-cream-dark">
                  <div
                    className="h-full rounded-full bg-jackson-green transition-all"
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Day of Week Breakdown */}
        <section className="rounded-2xl border border-jackson-cream-dark bg-jackson-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-jackson-charcoal">
            Call Volume by Day
          </h2>
          <p className="mt-1 text-sm text-jackson-charcoal-muted">
            When calls are coming in
          </p>

          <div className="mt-4 space-y-3">
            {report.dayOfWeekBreakdown?.map((day) => {
              const maxCalls = Math.max(
                ...report.dayOfWeekBreakdown.map((d) => d.total)
              );
              const percentage = maxCalls > 0 ? (day.total / maxCalls) * 100 : 0;
              return (
                <div key={day.day}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-jackson-charcoal">
                      {day.day}
                    </span>
                    <span className="text-jackson-charcoal-muted">
                      {day.total} calls
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-jackson-cream-dark">
                    <div
                      className="h-full rounded-full bg-jackson-green transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* AI Key Insights */}
      <section className="rounded-2xl border border-jackson-cream-dark bg-jackson-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-jackson-charcoal">
            Key Insights
          </h2>
          <span className="rounded-full bg-jackson-green/10 px-2 py-0.5 text-xs font-medium text-jackson-green">
            AI Generated
          </span>
        </div>
        {aiLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-jackson-cream-dark" />
            ))}
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {(aiInsights?.keyInsights || []).map((insight, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-jackson-green/10 text-xs font-medium text-jackson-green">
                  {index + 1}
                </span>
                <span className="text-sm text-jackson-charcoal">{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* AI Recommendations */}
      <section className="rounded-2xl border border-jackson-green/20 bg-jackson-green/5 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-jackson-charcoal">
            Recommended Actions
          </h2>
          <span className="rounded-full bg-jackson-green/10 px-2 py-0.5 text-xs font-medium text-jackson-green">
            AI Generated
          </span>
        </div>
        {aiLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-jackson-green/10" />
            ))}
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {(aiInsights?.recommendations || []).map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-jackson-green text-xs font-medium text-white">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
                <span className="text-sm text-jackson-charcoal">{rec}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl bg-jackson-cream-dark p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-jackson-charcoal-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-jackson-charcoal">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-jackson-charcoal-muted">{subtitle}</p>
    </div>
  );
}
