"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { GoogleGenAI } from "@google/genai";
import { useCanvas } from "@/lib/canvas-context";

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Lazy Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    console.log("Gemini API key exists:", !!apiKey);
    if (!apiKey) throw new Error("Gemini API key not set");
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Detect if user wants a visualization
function detectChartRequest(message: string): { isChart: boolean; chartType: "bar" | "line" | "pie" | "area" } {
  const lower = message.toLowerCase();
  const chartKeywords = ["chart", "graph", "visualize", "visualization", "plot", "show me a"];
  const isChart = chartKeywords.some((kw) => lower.includes(kw));

  if (lower.includes("pie")) return { isChart: true, chartType: "pie" };
  if (lower.includes("line") || lower.includes("trend")) return { isChart: true, chartType: "line" };
  if (lower.includes("area")) return { isChart: true, chartType: "area" };
  if (isChart) return { isChart: true, chartType: "bar" };

  return { isChart: false, chartType: "bar" };
}

// Detect if user wants a draft
function detectDraftRequest(message: string): { isDraft: boolean; draftType: "summary" | "report" | "analysis" | "list" } {
  const lower = message.toLowerCase();

  if (lower.includes("summary") || lower.includes("summarize")) return { isDraft: true, draftType: "summary" };
  if (lower.includes("report") || lower.includes("create a report")) return { isDraft: true, draftType: "report" };
  if (lower.includes("analysis") || lower.includes("analyze")) return { isDraft: true, draftType: "analysis" };
  if (lower.includes("list") || lower.includes("bullet")) return { isDraft: true, draftType: "list" };
  if (lower.includes("draft") || lower.includes("write")) return { isDraft: true, draftType: "summary" };

  return { isDraft: false, draftType: "summary" };
}

export function DataChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addChart, addDraft } = useCanvas();
  const router = useRouter();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchDataContext() {
    const supabase = supabaseBrowserClient();

    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const today = new Date();

    const { data: reportData } = await supabase.rpc("get_weekly_report", {
      p_start_date: fourWeeksAgo.toISOString().split("T")[0],
      p_end_date: today.toISOString().split("T")[0],
    });

    return reportData;
  }

  async function handleSubmit(e?: React.FormEvent | React.KeyboardEvent) {
    e?.preventDefault();
    const inputValue = inputRef.current?.value || "";
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    console.log("Submitting message:", userMessage);
    if (inputRef.current) inputRef.current.value = "";
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setIsExpanded(true);

    try {
      const dataContext = await fetchDataContext();
      const { isChart, chartType } = detectChartRequest(userMessage);
      const { isDraft, draftType } = detectDraftRequest(userMessage);

      const ai = getGeminiClient();

      if (isChart) {
        // Generate chart data
        const chartPrompt = `You are a data analyst. Based on this call data, generate chart data for the user's request.

DATA CONTEXT:
- Total Calls: ${dataContext?.totalCalls || 0}
- Daily Average: ${dataContext?.avgDailyCalls || 0}
- After-Hours: ${dataContext?.afterHoursCalls || 0} (${dataContext?.afterHoursPercentage || 0}%)

CALL CATEGORIES:
${dataContext?.categoryBreakdown?.map((c: { category: string; count: number }) => `- ${c.category}: ${c.count}`).join("\n") || "No data"}

CALLS BY DAY:
${dataContext?.dayOfWeekBreakdown?.map((d: { day: string; total: number }) => `- ${d.day}: ${d.total}`).join("\n") || "No data"}

USER REQUEST: ${userMessage}

Respond with ONLY valid JSON in this format (no markdown, no explanation):
{
  "title": "Short descriptive title",
  "data": [
    {"label": "Label1", "value": 123},
    {"label": "Label2", "value": 456}
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: chartPrompt,
        });

        let chartData;
        try {
          let jsonText = response.text || "{}";
          jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          chartData = JSON.parse(jsonText);
        } catch {
          chartData = { title: "Call Data", data: [] };
        }

        if (chartData.data && chartData.data.length > 0) {
          addChart({
            type: chartType,
            title: chartData.title || "Chart",
            data: chartData.data,
          });

          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `✨ Created a ${chartType} chart: "${chartData.title}". Check the Data Canvas tab to see it!` },
          ]);

          // Navigate to canvas
          router.push("/canvas");
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "I couldn't generate chart data. Try being more specific about what you want to visualize." },
          ]);
        }
      } else if (isDraft) {
        // Generate draft content
        const draftPrompt = `You are a business analyst for Pentridge, a property management company. Create a ${draftType} based on this call data.

DATA CONTEXT:
- Period: Last 4 weeks
- Total Calls: ${dataContext?.totalCalls || 0}
- Daily Average: ${dataContext?.avgDailyCalls || 0} calls/day
- After-Hours: ${dataContext?.afterHoursCalls || 0} (${dataContext?.afterHoursPercentage || 0}%)
- Peak Day: ${dataContext?.peakDay?.date || "N/A"} (${dataContext?.peakDay?.calls || 0} calls)

CALL CATEGORIES:
${dataContext?.categoryBreakdown?.map((c: { category: string; count: number; percentage: number }) => `- ${c.category}: ${c.count} (${c.percentage}%)`).join("\n") || "No data"}

CALLS BY DAY OF WEEK:
${dataContext?.dayOfWeekBreakdown?.map((d: { day: string; total: number; avg: number }) => `- ${d.day}: ${d.total} total (${d.avg}/day avg)`).join("\n") || "No data"}

USER REQUEST: ${userMessage}

Respond with ONLY valid JSON (no markdown):
{
  "title": "Title for the ${draftType}",
  "content": "The full ${draftType} content here. Use \\n for line breaks."
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: draftPrompt,
        });

        let draftData;
        try {
          let jsonText = response.text || "{}";
          jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          draftData = JSON.parse(jsonText);
        } catch {
          draftData = { title: "Draft", content: response.text || "Could not generate content." };
        }

        addDraft({
          type: draftType,
          title: draftData.title || "Draft",
          content: draftData.content || "No content generated.",
        });

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `📝 Created a ${draftType}: "${draftData.title}". Check the Data Canvas tab to view it!` },
        ]);

        // Navigate to canvas
        router.push("/canvas");
      } else {
        // Regular Q&A
        const conversationHistory = messages
          .slice(-6)
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n");

        const prompt = `You are a helpful AI assistant for Pentridge. Answer questions about their call data.

DATA CONTEXT (Last 4 weeks):
- Total Calls: ${dataContext?.totalCalls || 0}
- Daily Average: ${dataContext?.avgDailyCalls || 0} calls/day
- After-Hours: ${dataContext?.afterHoursCalls || 0} (${dataContext?.afterHoursPercentage || 0}%)
- Peak Day: ${dataContext?.peakDay?.date || "N/A"} with ${dataContext?.peakDay?.calls || 0} calls

CATEGORIES:
${dataContext?.categoryBreakdown?.map((c: { category: string; count: number; percentage: number }) => `- ${c.category}: ${c.count} (${c.percentage}%)`).join("\n") || "No data"}

BY DAY OF WEEK:
${dataContext?.dayOfWeekBreakdown?.map((d: { day: string; total: number; avg: number }) => `- ${d.day}: ${d.total} (avg: ${d.avg}/day)`).join("\n") || "No data"}

${conversationHistory ? `\nCONVERSATION:\n${conversationHistory}\n` : ""}

QUESTION: ${userMessage}

TIP: If the user wants visualizations, suggest they say "show me a chart of..." or "create a report...".

Answer concisely (2-3 sentences max).`;

        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: prompt,
        });

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.text || "I couldn't generate a response." },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Chat History - Expandable */}
      {(isExpanded || messages.length > 0) && (
        <div className="mb-3 max-h-[300px] overflow-y-auto rounded-xl border border-pentridge-purple-medium bg-pentridge-purple-dark">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-pentridge-purple-medium bg-pentridge-purple-dark px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-pentridge-purple-accent" />
              <span className="text-xs font-medium text-pentridge-text">
                Data Assistant
              </span>
              <span className="rounded bg-pentridge-purple-accent/10 px-1.5 py-0.5 text-[10px] text-pentridge-purple-accent">
                Gemini 3
              </span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="text-[10px] text-pentridge-text-muted hover:text-pentridge-text"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-pentridge-text-muted hover:text-pentridge-text"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-3">
            {messages.length === 0 ? (
              <div className="space-y-2 py-2">
                <p className="text-center text-xs text-pentridge-text-muted">
                  Ask questions or create visualizations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Chart calls by day",
                    "Draft a summary",
                    "Top categories?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        if (inputRef.current) inputRef.current.value = suggestion;
                      }}
                      className="rounded-full bg-pentridge-purple-medium px-2.5 py-1 text-[11px] text-pentridge-text transition hover:bg-pentridge-purple-light"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${message.role === "user"
                          ? "bg-pentridge-purple-light text-white"
                          : "bg-pentridge-purple-medium text-pentridge-text"
                        }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl bg-pentridge-purple-medium px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-pentridge-purple-accent" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-pentridge-purple-accent [animation-delay:0.1s]" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-pentridge-purple-accent [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Composer Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 rounded-xl border border-pentridge-purple-medium bg-pentridge-purple-dark p-2 shadow-sm transition-all focus-within:border-pentridge-purple-accent focus-within:ring-1 focus-within:ring-pentridge-purple-accent">
          <textarea
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            placeholder="Ask or create charts..."
            disabled={isLoading}
            rows={1}
            className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-pentridge-text placeholder-pentridge-text-muted focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-pentridge-purple-accent text-white transition hover:bg-pentridge-purple-light disabled:opacity-40"
          >
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-pentridge-text-muted">
          Try: &quot;chart calls by day&quot; or &quot;draft a summary&quot;
        </p>
      </form>
    </div>
  );
}
