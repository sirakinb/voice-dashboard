export type ReportInsights = {
  executiveSummary: string;
  keyInsights: string[];
};

export type DataChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type DataContext = {
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
      messages: DataChatMessage[];
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

export type ReportInsightsRequest = {
  periodStart: string;
  periodEnd: string;
  totalCalls: number;
  avgDailyCalls: number;
  afterHoursCalls: number;
  afterHoursPercentage: number;
  peakDay: { date: string; calls: number };
  categoryBreakdown: Array<{ category: string; count: number; percentage: number }>;
  dayOfWeekBreakdown: Array<{ day: string; total: number; avg: number }>;
};
