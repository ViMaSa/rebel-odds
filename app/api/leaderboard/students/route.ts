import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await adminClient
    .from("students")
    .select("id, name, major, standing, previous_gpa, performance_tier, streak")
    .order("streak", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const enriched = (data ?? []).map((s) => ({
    id:               s.id,
    name:             s.name,
    major:            s.major,
    standing:         s.standing,
    performance_tier: s.performance_tier,
    streak:           s.streak       ?? 0,
    peakStreak:       s.streak       ?? 0,
    previous_gpa:     s.previous_gpa ?? 0,
  }));

  return NextResponse.json({ ok: true, data: enriched });
}
