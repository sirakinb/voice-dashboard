export function FilterBar() {
  const filters = [
    { label: "Last 7 days" },
    { label: "All Callbacks" },
    { label: "All AI Capability" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
          >
            {filter.label}
            <span aria-hidden>▾</span>
          </button>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm"
        >
          More Filters
        </button>
      </div>
    </section>
  );
}
