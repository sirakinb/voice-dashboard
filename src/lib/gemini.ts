import { GoogleGenAI } from "@google/genai";

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export type ReportInsights = {
  executiveSummary: string;
  keyInsights: string[];
};

export async function generateReportInsights(reportData: {
  periodStart: string;
  periodEnd: string;
  totalCalls: number;
  avgDailyCalls: number;
  afterHoursCalls: number;
  afterHoursPercentage: number;
  peakDay: { date: string; calls: number };
  categoryBreakdown: Array<{ category: string; count: number; percentage: number }>;
  dayOfWeekBreakdown: Array<{ day: string; total: number; avg: number }>;
}): Promise<ReportInsights> {
  const prompt = `You are an AI analyst for Jackson Rental Homes, a property management company. 

IMPORTANT CONTEXT: Jackson Rental Homes ALREADY HAS an AI voice agent that handles all incoming calls 24/7. This dashboard displays the RESULTS of that AI agent's call handling. The AI agent is already implemented and working - it answers calls, captures leads, handles inquiries, and logs all interactions.

Analyze this weekly call data from the AI voice agent and provide insights.

DATA:
- Period: ${reportData.periodStart} to ${reportData.periodEnd}
- Total Calls Handled by AI: ${reportData.totalCalls}
- Daily Average: ${reportData.avgDailyCalls} calls/day
- Peak Day: ${reportData.peakDay?.date || 'N/A'} with ${reportData.peakDay?.calls || 0} calls
- After-Hours Calls Captured: ${reportData.afterHoursCalls} (${reportData.afterHoursPercentage}% of total)

CALL CATEGORIES:
${reportData.categoryBreakdown?.map(c => `- ${c.category}: ${c.count} calls (${c.percentage}%)`).join('\n') || 'No category data'}

CALLS BY DAY OF WEEK:
${reportData.dayOfWeekBreakdown?.map(d => `- ${d.day}: ${d.total} calls`).join('\n') || 'No day data'}

Please provide your analysis in this exact JSON format (no markdown, just raw JSON):
{
  "executiveSummary": "A 2-3 sentence summary of the week's AI agent performance and key takeaway",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"]
}

OUTPUT RULES — READ CAREFULLY:
The AI voice agent / intelligent phone system IS this product. It already answers calls around the clock, routes callers, and captures leads. This report is about WHAT HAPPENED in the data, not about acquiring phone technology.

NEVER write or imply recommendations about:
- Staffing, scheduling, or hiring people to answer phones
- IVRs, phone trees, auto-attendants, call routing, or "improving the phone system"
- Being "available 24/7," extending hours, or adding overnight coverage (the AI already handles after-hours)
- Connecting listings, inventory, CRM, or PMS systems "so callers can get availability" as if that were a missing project — treat that capability as already handled by the product where relevant

DO write about: factual patterns in the data, categories and volumes, timing, lead follow-up by the property team (humans), maintenance urgency, marketing or operational takeaways grounded in numbers.

Be specific with numbers. Keep insights concise (1 sentence each).`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });

    const text = response.text || "";

    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const parsed = JSON.parse(cleanedText);

    return {
      executiveSummary: parsed.executiveSummary || "Report analysis unavailable.",
      keyInsights: parsed.keyInsights || [],
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    // Return fallback insights if AI fails
    return {
      executiveSummary: `Your AI voice agent handled ${reportData.totalCalls} calls this week with an average of ${reportData.avgDailyCalls} calls per day. ${reportData.afterHoursCalls} calls (${reportData.afterHoursPercentage}%) occurred in after-hours windows.`,
      keyInsights: [
        `${reportData.categoryBreakdown?.[0]?.category || 'Primary category'} inquiries represent ${reportData.categoryBreakdown?.[0]?.percentage || 0}% of all calls`,
        `After-hours calls account for ${reportData.afterHoursPercentage}% of total volume`,
        `Peak activity occurred on ${reportData.peakDay?.date || 'N/A'} with ${reportData.peakDay?.calls || 0} calls`,
      ],
    };
  }
}

