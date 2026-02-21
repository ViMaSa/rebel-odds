import { NextResponse } from "next/server";

import { getLeaderboard, getPlatformStats } from "@/lib/market";

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: getLeaderboard(),
    platform: getPlatformStats(),
    disclaimer: "Paper trading only. Rebel Tokens have no cash value.",
  });
}
