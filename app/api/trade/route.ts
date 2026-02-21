import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { executeTrade } from "@/lib/market";
import { TradeAction, TradeSide } from "@/types/trade";

function parseSide(value: string): TradeSide | null {
  if (value === "yes" || value === "no") {
    return value;
  }
  return null;
}

function parseAction(value: string): TradeAction | null {
  if (value === "buy" || value === "sell") {
    return value;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const body = await request.json();

    const side = parseSide(String(body.side ?? ""));
    const action = parseAction(String(body.action ?? ""));
    const amountTokens = Number(body.amountTokens);
    const contractId = String(body.contractId ?? "");

    if (!side || !action || !contractId) {
      return NextResponse.json({ ok: false, error: "Invalid trade payload." }, { status: 400 });
    }
    if (!Number.isFinite(amountTokens) || amountTokens <= 0) {
      return NextResponse.json(
        { ok: false, error: "amountTokens must be a positive number." },
        { status: 400 },
      );
    }

    const data = await executeTrade(user.id, {
      contractId,
      side,
      action,
      amountTokens,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}
