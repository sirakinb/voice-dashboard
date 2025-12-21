import type { CallRecord } from "@/lib/mockData";

type CallRecordsTableProps = {
  records: CallRecord[];
};

const statusStyles: Record<CallRecord["callbackRequired"], string> = {
  Yes: "bg-rose-900/20 text-rose-400",
  No: "bg-pentridge-purple-accent/10 text-pentridge-purple-accent",
};

const aiStyles: Record<CallRecord["aiCouldHandle"], string> = {
  Yes: "bg-pentridge-purple-accent/10 text-pentridge-purple-accent",
  No: "bg-rose-900/20 text-rose-400",
  Partial: "bg-amber-900/20 text-amber-400",
};

export function CallRecordsTable({ records }: CallRecordsTableProps) {
  return (
    <section className="rounded-2xl border border-pentridge-purple-medium bg-pentridge-purple-dark p-0 shadow-sm">
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-pentridge-text">Call Records</h2>
          <p className="text-sm text-pentridge-text-muted">
            Showing {records.length} of 182 results
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-pentridge-purple-medium px-3 py-2 text-sm text-pentridge-text-muted">
          <span aria-hidden>◀</span>
          <span className="mx-2 font-medium text-pentridge-text">1</span>
          <span aria-hidden>▶</span>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-pentridge-purple-medium text-left text-sm text-pentridge-text-muted">
          <thead className="bg-pentridge-purple-darker text-xs font-medium uppercase text-pentridge-text-muted">
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
          <tbody className="divide-y divide-pentridge-purple-medium bg-pentridge-purple-dark">
            {records.map((record) => (
              <tr key={record.callNumber} className="align-top hover:bg-pentridge-purple-medium/50 transition-colors">
                <td className="px-6 py-4 font-medium text-pentridge-text">
                  {record.createdTime}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pentridge-purple-medium text-sm font-semibold text-white">
                      {record.callerInitials}
                    </div>
                    <div className="min-w-[140px]">
                      <p className="font-medium text-pentridge-text">
                        {record.callerName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{record.phoneNumber}</td>
                <td className="px-6 py-4 text-pentridge-text-muted">
                  {record.transcriptPreview}
                </td>
                <td className="px-6 py-4 text-pentridge-text-muted">
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
                    className="text-sm font-medium text-pentridge-purple-accent hover:text-pentridge-purple-light"
                  >
                    ▶ Play
                  </a>
                </td>
                <td className="px-6 py-4 font-medium text-pentridge-text">
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
