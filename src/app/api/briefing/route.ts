import { NextResponse } from "next/server";
import { generateDailyBriefing } from "@/lib/briefing-engine";

export async function GET() {
  const briefing = generateDailyBriefing();
  return NextResponse.json(briefing);
}
