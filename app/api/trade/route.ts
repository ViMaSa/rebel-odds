import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { executeTrade } from "@/lib/market";
import { TradeAction, TradeSide } from "@/types/trade";

function parseSide(value: string): TradeSide | null {
  return value === "yes" || value === "no" ? value : null;
}
function parseAction(value: string): TradeAction | null {
  return value === "buy" || value === "sell" ? value : null;
}

// LOSE UUID CHECK: "8-4-4-4-12" hex groups (does NOT enforce RFC version bits)
const UUID_LOOSE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();

    const side = parseSide(String(body.side ?? ""));
    const action = parseAction(String(body.action ?? ""));
    const amountTokens = Number(body.amountTokens);
    const contractId = String(body.contractId ?? "");

    if (!side || !action) {
      return NextResponse.json({ ok: false, error: "Invalid trade payload." }, { status: 400 });
    }

    if (!UUID_LOOSE_RE.test(contractId)) {
      return NextResponse.json({ ok: false, error: `Invalid UUID for contractId: ${contractId}` }, { status: 400 });
    }

    if (!Number.isFinite(amountTokens) || amountTokens <= 0) {
      return NextResponse.json({ ok: false, error: "amountTokens must be a positive number." }, { status: 400 });
    }

    const data = await executeTrade(user.id, { contractId, side, action, amountTokens });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}
