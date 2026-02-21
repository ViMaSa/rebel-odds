import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) {
    return NextResponse.json({ user: null, error: userErr.message }, { status: 200 });
  }

  const user = userData.user;
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // These table names/columns MUST match your schema.
  // If your tables differ, tell me what they’re called and I’ll adjust.
  const [{ data: profile }, { data: wallet }] = await Promise.all([
    supabase.from("profiles").select("id, username").eq("id", user.id).maybeSingle(),
    supabase.from("wallets").select("id, balance_tokens").eq("user_id", user.id).maybeSingle(),
  ]);

  return NextResponse.json({
    user: { id: user.id, email: user.email ?? undefined },
    profile: profile ?? null,
    wallet: wallet ?? null,
  });
}
