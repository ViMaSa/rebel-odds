import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { data: profiles, error: profileError } = await adminClient
  .from("profiles")
  .select("id, username, role")
  .eq("role", "trader")
  .limit(1);

const profile = profiles?.[0] ?? null;


if (!profile || !profile.id) {
  return NextResponse.json({ ok: false, error: "No trader found." }, { status: 404 });
}

// now use profile.id explicitly
const userId = profile.id;

const [walletResult, positionsResult, tradesResult] = await Promise.all([
  adminClient
    .from("wallets")
    .select("*")
    .eq("user_id", userId)  // use userId variable
    .single(),

  adminClient
    .from("positions")
    .select(`
      *,
      contracts(
        id, title, status, yes_token_pool, no_token_pool, seed_tokens,
        students(name, major, performance_tier)
      )
    `)
    .eq("user_id", userId),  // use userId variable

  adminClient
    .from("trades")
    .select(`*, contracts(id, title)`)
    .eq("user_id", userId)   // use userId variable
    .order("created_at", { ascending: false })
    .limit(20),
]);

  
  if (!walletResult.data) {
    return NextResponse.json({ ok: false, error: "Wallet not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      wallet:    walletResult.data,
      positions: positionsResult.data ?? [],
      trades:    tradesResult.data ?? [],
    },
  });
}