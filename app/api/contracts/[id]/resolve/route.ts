import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

// GET /api/contracts/:id/resolve (name is odd but leaving your route structure as-is)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Contract ID is required." }, { status: 400 });
    }

    const { data: contract, error } = await adminClient
      .from("contracts")
      .select(
        `
        *,
        students(*),
        professors(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error || !contract) {
      return NextResponse.json({ ok: false, error: "Contract not found." }, { status: 404 });
    }

    const yesPool = Number(contract.yes_token_pool ?? 0) + Number(contract.seed_tokens ?? 0);
    const noPool = Number(contract.no_token_pool ?? 0) + Number(contract.seed_tokens ?? 0);
    const priceYes = yesPool / (yesPool + noPool);
    const priceNo = parseFloat((1 - priceYes).toFixed(4));

    const { data: recentTrades } = await adminClient
      .from("trades")
      .select("id, side, tokens_spent, shares_received, fee, price_yes_at_trade, price_no_at_trade, created_at")
      .eq("contract_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      ok: true,
      data: {
        ...contract,
        price_yes: priceYes,
        price_no: priceNo,
        recent_trades: recentTrades ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}