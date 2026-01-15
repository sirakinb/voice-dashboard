import type { CallRecord } from "@/lib/mockData";

type CallRecordsTableProps = {
  records: CallRecord[];
};

const statusStyles: Record<CallRecord["callbackRequired"], string> = {
  Yes: "bg-rose-900/20 text-rose-400",
  No: "bg-jackson-green/10 text-jackson-green",
};

const aiStyles: Record<CallRecord["aiCouldHandle"], string> = {
  Yes: "bg-jackson-green/10 text-jackson-green",
  No: "bg-rose-900/20 text-rose-400",
  Partial: "bg-amber-900/20 text-amber-400",
};

export function CallRecordsTable({ records }: CallRecordsTableProps) {
  return (
    <section className="rounded-2xl border border-jackson-cream-dark bg-jackson-white p-0 shadow-sm">
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-jackson-charcoal">Call Records</h2>
          <p className="text-sm text-jackson-text-muted">
            Showing {records.length} of 182 results
          </p>
        </div>
          <div className="flex items-center gap-1 rounded-lg border border-jackson-cream-dark px-3 py-2 text-sm text-jackson-text-muted">
          <span aria-hidden>◀</span>
          <span className="mx-2 font-medium text-jackson-charcoal">1</span>
          <span aria-hidden>▶</span>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-jackson-cream-dark text-left text-sm text-jackson-text-muted">
          <thead className="bg-jackson-cream text-xs font-medium uppercase text-jackson-text-muted">
            <tr>
              <th className="px-6 py-3">Created Time</th>
              <th className="px-6 py-3">Caller Name</th>
              <th className="px-6 py-3">Phone Number</th>
              <th className="px-6 py-3">Transcript</th>
              <th className="px-6 py-3">Call Summary</th>
              <th className="px-6 py-3">Callback Required</th>
              <th className="px-6 py-3">Could AI Handle?</th>
              <th className="px-6 py-3">Call Recording</th>
              <th className="px-6 py-3">Call Number</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-jackson-cream-dark bg-jackson-white">
            {records.map((record) => (
              <tr key={record.callNumber} className="align-top hover:bg-jackson-cream transition-colors">
                  <td className="px-6 py-4 font-medium text-jackson-charcoal">
                  {record.createdTime}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-jackson-green text-sm font-semibold text-white">
                      {record.callerInitials}
                    </div>
                    <div className="min-w-[140px]">
                      <p className="font-medium text-jackson-charcoal">
                        {record.callerName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{record.phoneNumber}</td>
                <td className="px-6 py-4 text-jackson-text-muted">
                  {record.transcriptPreview}
                </td>
                <td className="px-6 py-4 text-jackson-text-muted">
                  {record.callSummary}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[record.callbackRequired]}`}
                  >
                    {record.callbackRequired}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${aiStyles[record.aiCouldHandle]}`}
                  >
                    {record.aiCouldHandle}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={record.recordingUrl}
                    className="text-sm font-medium text-jackson-green hover:text-jackson-green-dark"
                  >
                    ▶ Play
                  </a>
                </td>
                  <td className="px-6 py-4 font-medium text-jackson-charcoal">
                  {record.callNumber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
