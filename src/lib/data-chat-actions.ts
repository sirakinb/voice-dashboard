"use server";

import { generateGeminiText } from "@/lib/gemini";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type DataContext = {
  totalCalls?: number;
  avgDailyCalls?: number;
  afterHoursCalls?: number;
  afterHoursPercentage?: number;
  peakDay?: { date?: string; calls?: number };
  categoryBreakdown?: Array<{ category: string; count: number; percentage?: number }>;
  dayOfWeekBreakdown?: Array<{ day: string; total: number; avg?: number }>;
} | null;

export type DataChatRequest =
  | {
      kind: "chart";
      userMessage: string;
      dataContext: DataContext;
    }
  | {
      kind: "draft";
      draftType: "summary" | "report" | "analysis" | "list";
      userMessage: string;
      dataContext: DataContext;
    }
  | {
      kind: "answer";
      userMessage: string;
      dataContext: DataContext;
      messages: Message[];
    };

export type DataChatResponse =
  | {
      kind: "chart";
      title: string;
      data: Array<{ label: string; value: number }>;
    }
  | {
      kind: "draft";
      title: string;
      content: string;
    }
  | {
      kind: "answer";
      content: string;
    };

/** Jackson already uses this app's AI voice agent; never advise replacing or "adding" phone/IVR/staffing. */
const PRODUCT_CONTEXT_RULES = `
PRODUCT CONTEXT (non-negotiable):
Jackson Rental Homes already uses an AI voice agent / intelligent IVR: it answers calls, handles routing, captures leads, and logs activity. This dashboard is the RESULT of that system.

You MUST NOT recommend or suggest:
- Staffing, shifts, or hiring people to cover phones
- Adding, fixing, or upgrading IVRs, phone trees, auto-attendants, or "better call routing"
- Extended hours, "answer around the clock," or overnight phone coverage as something to implement
- Integrating inventory, listings, CRM, or PMS "so callers get availability" as a project to start - frame as business follow-up on leads the AI already captured, not as missing telecom

Stay grounded in the numbers and operational follow-up (e.g. leasing team callbacks, maintenance triage), not phone-system projects.
`.trim();

function cleanJsonText(text: string) {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

export async function generateDataChatResponse(
  request: DataChatRequest
): Promise<DataChatResponse> {
  const dataContext = request.dataContext;

  if (request.kind === "chart") {
    const chartPrompt = `You are a data analyst. Based on this call data, generate chart data for the user's request.

DATA CONTEXT:
- Total Calls: ${dataContext?.totalCalls || 0}
- Daily Average: ${dataContext?.avgDailyCalls || 0}
- After-Hours: ${dataContext?.afterHoursCalls || 0} (${dataContext?.afterHoursPercentage || 0}%)

CALL CATEGORIES:
${dataContext?.categoryBreakdown?.map((c) => `- ${c.category}: ${c.count}`).join("\n") || "No data"}

CALLS BY DAY:
${dataContext?.dayOfWeekBreakdown?.map((d) => `- ${d.day}: ${d.total}`).join("\n") || "No data"}

USER REQUEST: ${request.userMessage}

${PRODUCT_CONTEXT_RULES}

Respond with ONLY valid JSON in this format (no markdown, no explanation):
{
  "title": "Short descriptive title",
  "data": [
    {"label": "Label1", "value": 123},
    {"label": "Label2", "value": 456}
  ]
}`;

    const text = await generateGeminiText(chartPrompt);
    const chartData = JSON.parse(cleanJsonText(text)) as {
      title?: string;
      data?: Array<{ label: string; value: number }>;
    };

    if (!chartData.title?.trim()) {
      throw new Error("Gemini returned chart JSON without title");
    }
    if (!Array.isArray(chartData.data) || chartData.data.length === 0) {
      throw new Error("Gemini returned chart JSON without data");
    }

    return {
      kind: "chart",
      title: chartData.title.trim(),
      data: chartData.data,
    };
  }

  if (request.kind === "draft") {
    const draftPrompt = `You are a business analyst for Jackson Rental Homes, a property management company. Create a ${request.draftType} based on this call data.

DATA CONTEXT:
- Period: Last 4 weeks
- Total Calls: ${dataContext?.totalCalls || 0}
- Daily Average: ${dataContext?.avgDailyCalls || 0} calls/day
- After-Hours: ${dataContext?.afterHoursCalls || 0} (${dataContext?.afterHoursPercentage || 0}%)
- Peak Day: ${dataContext?.peakDay?.date || "N/A"} (${dataContext?.peakDay?.calls || 0} calls)

CALL CATEGORIES:
${dataContext?.categoryBreakdown?.map((c) => `- ${c.category}: ${c.count} (${c.percentage || 0}%)`).join("\n") || "No data"}

CALLS BY DAY OF WEEK:
${dataContext?.dayOfWeekBreakdown?.map((d) => `- ${d.day}: ${d.total} total (${d.avg || 0}/day avg)`).join("\n") || "No data"}

USER REQUEST: ${request.userMessage}

${PRODUCT_CONTEXT_RULES}

Respond with ONLY valid JSON (no markdown):
{
  "title": "Title for the ${request.draftType}",
  "content": "The full ${request.draftType} content here. Use \\n for line breaks."
}`;

    const text = await generateGeminiText(draftPrompt);
    const draftData = JSON.parse(cleanJsonText(text)) as {
      title?: string;
      content?: string;
    };

    if (!draftData.title?.trim()) {
      throw new Error("Gemini returned draft JSON without title");
    }
    if (!draftData.content?.trim()) {
      throw new Error("Gemini returned draft JSON without content");
    }

    return {
      kind: "draft",
      title: draftData.title.trim(),
      content: draftData.content.trim(),
    };
  }

  const conversationHistory = request.messages
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `You are a helpful AI assistant for Jackson Rental Homes. Answer questions about their call data.

DATA CONTEXT (Last 4 weeks):
- Total Calls: ${dataContext?.totalCalls || 0}
- Daily Average: ${dataContext?.avgDailyCalls || 0} calls/day
- After-Hours: ${dataContext?.afterHoursCalls || 0} (${dataContext?.afterHoursPercentage || 0}%)
- Peak Day: ${dataContext?.peakDay?.date || "N/A"} with ${dataContext?.peakDay?.calls || 0} calls

CATEGORIES:
${dataContext?.categoryBreakdown?.map((c) => `- ${c.category}: ${c.count} (${c.percentage || 0}%)`).join("\n") || "No data"}

BY DAY OF WEEK:
${dataContext?.dayOfWeekBreakdown?.map((d) => `- ${d.day}: ${d.total} (avg: ${d.avg || 0}/day)`).join("\n") || "No data"}

${conversationHistory ? `\nCONVERSATION:\n${conversationHistory}\n` : ""}

QUESTION: ${request.userMessage}

${PRODUCT_CONTEXT_RULES}

TIP: If the user wants visualizations, suggest they say "show me a chart of..." or "create a report...".

Answer concisely (2-3 sentences max).`;

  const text = await generateGeminiText(prompt);

  return {
    kind: "answer",
    content: text,
  };
}
