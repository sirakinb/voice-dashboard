type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  connectionLabel?: string;
};

export function DashboardHeader({
  title,
  subtitle,
  connectionLabel,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-pentridge-text">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-pentridge-text-muted">{subtitle}</p>
        ) : null}
      </div>
      {connectionLabel ? (
        <div className="flex items-center gap-2 rounded-full bg-pentridge-purple-accent/10 px-4 py-2 text-sm font-medium text-pentridge-purple-accent">
          <span className="h-2 w-2 rounded-full bg-pentridge-purple-accent" aria-hidden />
          {connectionLabel}
        </div>
      ) : null}
    </header>
  );
}
