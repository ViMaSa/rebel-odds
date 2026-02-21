import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { getPortfolio } from "@/lib/market";

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({
      ok: true,
      data: getPortfolio(user.id),
      disclaimer: "Paper trading only. Rebel Tokens have no cash value.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}
