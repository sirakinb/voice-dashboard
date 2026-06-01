import type {
  DataChatRequest,
  DataChatResponse,
  ReportInsights,
  ReportInsightsRequest,
} from "@/lib/gemini-types";

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function requestDataChat(
  request: DataChatRequest
): Promise<DataChatResponse> {
  const res = await fetch("/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return parseJsonResponse<DataChatResponse>(res);
}

export async function requestReportInsights(
  request: ReportInsightsRequest
): Promise<ReportInsights> {
  const res = await fetch("/api/gemini/report-insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return parseJsonResponse<ReportInsights>(res);
}
