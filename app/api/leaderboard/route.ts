import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await adminClient
    .from("wallets")
    .select("user_id,balance_tokens")
    .order("balance_tokens", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    data: data ?? [],
    disclaimer: "Paper trading only. Rebel Tokens have no cash value.",
  });
}