// Demo data for Voice Dashboard
export type DemoCallRecord = {
    id: string;
    caller_name: string;
    caller_phone: string;
    call_date: string;
    call_time: string;
    duration: string;
    category: string;
    status: "completed" | "missed" | "voicemail";
    ai_handled: boolean;
    summary: string;
};

export type DemoReportData = {
    periodStart: string;
    periodEnd: string;
    totalDays: number;
    totalCalls: number;
    avgDailyCalls: number;
    afterHoursCalls: number;
    afterHoursPercentage: number;
    peakDay: {
        date: string;
        calls: number;
    };
    categoryBreakdown: Array<{
        category: string;
        count: number;
        percentage: number;
    }>;
    dayOfWeekBreakdown: Array<{
        day: string;
        dayNumber: number;
        total: number;
        avg: number;
    }>;
};

// Sample call records
export const demoCallRecords: DemoCallRecord[] = [
    {
        id: "1",
        caller_name: "Sarah Mitchell",
        caller_phone: "(215) 555-0142",
        call_date: "2025-12-02",
        call_time: "09:23 AM",
        duration: "4:32",
        category: "Property Inquiry",
        status: "completed",
        ai_handled: true,
        summary: "Interested in 2BR apartment in Center City. Scheduled viewing for Thursday at 2 PM.",
    },
    {
        id: "2",
        caller_name: "Marcus Johnson",
        caller_phone: "(267) 555-0198",
        call_date: "2025-12-02",
        call_time: "11:45 AM",
        duration: "2:18",
        category: "Maintenance Request",
        status: "completed",
        ai_handled: true,
        summary: "Reported heating issue in unit 4B. Created work order #2847.",
    },
    {
        id: "3",
        caller_name: "Emily Chen",
        caller_phone: "(484) 555-0223",
        call_date: "2025-12-01",
        call_time: "07:15 PM",
        duration: "6:45",
        category: "Lease Inquiry",
        status: "completed",
        ai_handled: true,
        summary: "Questions about lease renewal options. Sent renewal packet via email.",
    },
    {
        id: "4",
        caller_name: "David Rodriguez",
        caller_phone: "(610) 555-0176",
        call_date: "2025-12-01",
        call_time: "02:30 PM",
        duration: "3:12",
        category: "Payment Question",
        status: "completed",
        ai_handled: true,
        summary: "Asked about payment portal access. Reset credentials sent to email.",
    },
    {
        id: "5",
        caller_name: "Jennifer Park",
        caller_phone: "(215) 555-0289",
        call_date: "2025-12-01",
        call_time: "10:05 AM",
        duration: "5:23",
        category: "Property Inquiry",
        status: "completed",
        ai_handled: true,
        summary: "Looking for pet-friendly 1BR. Provided list of available units.",
    },
    {
        id: "6",
        caller_name: "Unknown Caller",
        caller_phone: "(267) 555-0134",
        call_date: "2025-11-30",
        call_time: "08:45 PM",
        duration: "0:00",
        category: "General",
        status: "missed",
        ai_handled: false,
        summary: "No voicemail left.",
    },
];

// Sample weekly report data
export const demoReportData: DemoReportData = {
    periodStart: "2025-11-25",
    periodEnd: "2025-12-01",
    totalDays: 7,
    totalCalls: 127,
    avgDailyCalls: 18.1,
    afterHoursCalls: 42,
    afterHoursPercentage: 33,
    peakDay: {
        date: "2025-11-27",
        calls: 24,
    },
    categoryBreakdown: [
        { category: "Property Inquiry", count: 48, percentage: 38 },
        { category: "Maintenance Request", count: 35, percentage: 28 },
        { category: "Lease Inquiry", count: 22, percentage: 17 },
        { category: "Payment Question", count: 15, percentage: 12 },
        { category: "General", count: 7, percentage: 5 },
    ],
    dayOfWeekBreakdown: [
        { day: "Monday", dayNumber: 1, total: 22, avg: 22 },
        { day: "Tuesday", dayNumber: 2, total: 19, avg: 19 },
        { day: "Wednesday", dayNumber: 3, total: 24, avg: 24 },
        { day: "Thursday", dayNumber: 4, total: 18, avg: 18 },
        { day: "Friday", dayNumber: 5, total: 21, avg: 21 },
        { day: "Saturday", dayNumber: 6, total: 14, avg: 14 },
        { day: "Sunday", dayNumber: 7, total: 9, avg: 9 },
    ],
};

// Sample AI insights
export const demoAIInsights = {
    executiveSummary:
        "Your AI voice agent handled 127 calls this week with strong performance. After-hours coverage captured 42 calls (33%) that would have been missed, representing significant lead capture opportunity.",
    keyInsights: [
        "Property inquiries represent 38% of all calls, indicating strong market interest",
        "After-hours calls account for 33% of total volume, validating 24/7 AI coverage",
        "Peak activity occurred on Wednesday with 24 calls",
        "Maintenance requests increased 15% compared to previous week",
        "Average call duration of 4.2 minutes shows thorough AI engagement",
    ],
    recommendations: [
        "Follow up on 48 property inquiry leads within 24 hours to maximize conversion",
        "Review maintenance request patterns to identify potential property issues",
        "Consider staffing adjustments based on Wednesday peak call volume",
        "Analyze after-hours inquiries for patterns in prospect availability",
    ],
};

// Sample call volume data for charts
export const demoCallVolumeData = [
    { date: "Nov 25", totalCalls: 22, aiHandled: 20 },
    { date: "Nov 26", totalCalls: 19, aiHandled: 18 },
    { date: "Nov 27", totalCalls: 24, aiHandled: 23 },
    { date: "Nov 28", totalCalls: 18, aiHandled: 17 },
    { date: "Nov 29", totalCalls: 21, aiHandled: 20 },
    { date: "Nov 30", totalCalls: 14, aiHandled: 12 },
    { date: "Dec 1", totalCalls: 9, aiHandled: 8 },
];

// Sample canvas charts
export const demoCanvasCharts = [
    {
        id: "chart-1",
        type: "bar" as const,
        title: "Calls by Category (Last 7 Days)",
        data: [
            { label: "Property Inquiry", value: 48 },
            { label: "Maintenance", value: 35 },
            { label: "Lease Questions", value: 22 },
            { label: "Payment", value: 15 },
            { label: "General", value: 7 },
        ],
        createdAt: new Date("2025-12-02T10:30:00"),
    },
    {
        id: "chart-2",
        type: "line" as const,
        title: "Daily Call Trend",
        data: [
            { label: "Mon", value: 22 },
            { label: "Tue", value: 19 },
            { label: "Wed", value: 24 },
            { label: "Thu", value: 18 },
            { label: "Fri", value: 21 },
            { label: "Sat", value: 14 },
            { label: "Sun", value: 9 },
        ],
        createdAt: new Date("2025-12-02T11:15:00"),
    },
];

// Sample canvas drafts
export const demoCanvasDrafts = [
    {
        id: "draft-1",
        type: "summary" as const,
        title: "Weekly Performance Summary",
        content: `This week showed strong AI performance with 127 total calls handled. Key highlights:

• 38% of calls were property inquiries, showing healthy market interest
• 33% after-hours coverage prevented missed opportunities
• Wednesday was the peak day with 24 calls
• Average response quality maintained at 95%

The AI successfully scheduled 18 property viewings and created 35 maintenance work orders.`,
        createdAt: new Date("2025-12-02T09:00:00"),
    },
    {
        id: "draft-2",
        type: "report" as const,
        title: "After-Hours Call Analysis",
        content: `After-Hours Performance Report (Nov 25 - Dec 1)

Total After-Hours Calls: 42 (33% of total volume)

Breakdown by Time:
• 5 PM - 8 PM: 24 calls (57%)
• 8 PM - 11 PM: 13 calls (31%)
• 11 PM - 8 AM: 5 calls (12%)

Top Categories:
1. Property Inquiries: 18 calls
2. Maintenance Requests: 12 calls
3. General Questions: 12 calls

Impact: Without 24/7 AI coverage, these 42 calls would have gone to voicemail, representing potential lost revenue and customer satisfaction issues.`,
        createdAt: new Date("2025-12-02T14:30:00"),
    },
];
