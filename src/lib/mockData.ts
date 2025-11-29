export type CallRecord = {
  callNumber: string;
  createdTime: string;
  callerName: string;
  callerInitials: string;
  phoneNumber: string;
  transcriptPreview: string;
  callSummary: string;
  callbackRequired: "Yes" | "No";
  aiCouldHandle: "Yes" | "No" | "Partial";
  recordingUrl?: string;
};

export type StatCard = {
  label: string;
  value: string;
  change: number;
};

export type CallVolumeDatum = {
  day: string;
  isoDate: string;
  totalCalls: number;
  aiHandled: number;
};

export const statCards: StatCard[] = [
  {
    label: "Total Calls",
    value: "182",
    change: 8.4,
  },
  {
    label: "% of Calls AI Could Handle",
    value: "72%",
    change: 6.1,
  },
  {
    label: "Callbacks Required",
    value: "18%",
    change: -4.7,
  },
];

export const dailyCallVolume: CallVolumeDatum[] = [
  { day: "Mon", isoDate: "2024-08-12", totalCalls: 22, aiHandled: 17 },
  { day: "Tue", isoDate: "2024-08-13", totalCalls: 34, aiHandled: 25 },
  { day: "Wed", isoDate: "2024-08-14", totalCalls: 28, aiHandled: 20 },
  { day: "Thu", isoDate: "2024-08-15", totalCalls: 33, aiHandled: 24 },
  { day: "Fri", isoDate: "2024-08-16", totalCalls: 39, aiHandled: 27 },
  { day: "Sat", isoDate: "2024-08-17", totalCalls: 16, aiHandled: 11 },
  { day: "Sun", isoDate: "2024-08-18", totalCalls: 10, aiHandled: 7 },
];

export const hourlyCallVolume: CallVolumeDatum[] = Array.from(
  { length: 24 },
  (_, index) => {
    const hour = index.toString().padStart(2, "0");
    return {
      day: `${hour}:00`,
      isoDate: `2024-08-18T${hour}:00:00Z`,
      totalCalls: Math.max(0, Math.round(8 + Math.sin(index / 2) * 4)),
      aiHandled: Math.max(0, Math.round(5 + Math.cos(index / 2) * 2)),
    };
  }
);

export const callRecords: CallRecord[] = [
  {
    callNumber: "JR-240815-01",
    createdTime: "Aug 18, 2024 10:12 AM",
    callerName: "Samantha Lee",
    callerInitials: "SL",
    phoneNumber: "(470) •••• 8821",
    transcriptPreview:
      "I'm following up on the Riverwalk apartment availability...",
    callSummary:
      "Prospect requesting updated rent specials for Riverwalk property.",
    callbackRequired: "No",
    aiCouldHandle: "Yes",
    recordingUrl: "#",
  },
  {
    callNumber: "JR-240815-02",
    createdTime: "Aug 18, 2024 9:47 AM",
    callerName: "Marcus Grant",
    callerInitials: "MG",
    phoneNumber: "(470) •••• 3298",
    transcriptPreview:
      "The maintenance request for unit 204 hasn't been closed yet...",
    callSummary:
      "Existing resident asking for status update on HVAC maintenance ticket.",
    callbackRequired: "Yes",
    aiCouldHandle: "No",
    recordingUrl: "#",
  },
  {
    callNumber: "JR-240814-07",
    createdTime: "Aug 14, 2024 4:33 PM",
    callerName: "Denise Holloway",
    callerInitials: "DH",
    phoneNumber: "(912) •••• 1176",
    transcriptPreview:
      "I'd like to schedule a tour for the Bradshaw townhome...",
    callSummary: "Lead coordinating in-person tour for Bradshaw townhome.",
    callbackRequired: "No",
    aiCouldHandle: "Yes",
    recordingUrl: "#",
  },
  {
    callNumber: "JR-240813-03",
    createdTime: "Aug 13, 2024 1:22 PM",
    callerName: "Noah Patel",
    callerInitials: "NP",
    phoneNumber: "(404) •••• 6642",
    transcriptPreview:
      "I'm moving out next month and need instructions for keys...",
    callSummary:
      "Resident asked for move-out checklist and deposit return timing.",
    callbackRequired: "Yes",
    aiCouldHandle: "No",
    recordingUrl: "#",
  },
  {
    callNumber: "JR-240812-11",
    createdTime: "Aug 12, 2024 11:05 AM",
    callerName: "Elena Martinez",
    callerInitials: "EM",
    phoneNumber: "(678) •••• 4580",
    transcriptPreview:
      "Do you have any pet-friendly homes near Decatur available...",
    callSummary: "Prospect verifying pet policy and availability near Decatur.",
    callbackRequired: "No",
    aiCouldHandle: "Yes",
    recordingUrl: "#",
  },
];
