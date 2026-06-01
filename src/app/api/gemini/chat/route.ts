import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { generateDataChatResponse } from "@/lib/gemini-server";
import type { DataChatRequest } from "@/lib/gemini-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DataChatRequest;
    const result = await generateDataChatResponse(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/gemini/chat error:", error);
    const message = error instanceof Error ? error.message : "Gemini chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
