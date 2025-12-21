import type { StatCard as StatCardData } from "@/lib/mockData";

export function StatCard({ label, value, change }: StatCardData) {
  const isPositive = change >= 0;

  return (
    <article className="rounded-2xl border border-pentridge-purple-medium bg-pentridge-purple-dark p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-pentridge-purple-accent">{label}</p>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-3xl font-semibold text-pentridge-text">{value}</p>
        <p
          className={`text-xs font-medium ${isPositive ? "text-pentridge-purple-accent" : "text-rose-400"
            }`}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(change)}%
        </p>
      </div>
      <p className="mt-2 text-xs text-pentridge-text-muted">vs. previous period</p>
    </article>
  );
}
