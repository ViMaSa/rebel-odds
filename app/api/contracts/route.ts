import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

type ContractType = "gpa" | "course";

function parseContractType(value: string): ContractType | null {
  if (value === "gpa" || value === "course") return value;
  return null;
}

// GET /api/contracts
export async function GET() {
  const { data: contracts, error } = await adminClient
    .from("contracts")
    .select(`
      *,
      students(*),
      professors(*)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    data: contracts,
    disclaimer: "Paper trading only. Rebel Tokens have no cash value.",
  });
}

// POST /api/contracts
export async function POST(request: Request) {
  try {
    // await requireAdmin();

    const body = await request.json();

    const type = parseContractType(String(body.type ?? ""));
    if (!type) {
      return NextResponse.json({ ok: false, error: "Invalid contract type." }, { status: 400 });
    }

    const threshold = Number(body.threshold);
    if (!Number.isFinite(threshold)) {
      return NextResponse.json({ ok: false, error: "Invalid threshold." }, { status: 400 });
    }

    if (!body.studentId || !body.title) {
      return NextResponse.json({ ok: false, error: "title and studentId are required." }, { status: 400 });
    }

    // fetch student
    const { data: student, error: studentError } = await adminClient
      .from("students")
      .select("*")
      .eq("id", body.studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ ok: false, error: "Student not found." }, { status: 404 });
    }

    // fetch professor if provided
    let professor = null;
    if (body.professorId) {
      const { data: prof } = await adminClient
        .from("professors")
        .select("*")
        .eq("id", body.professorId)
        .single();
      professor = prof;
    }

    // calculate starting odds from all factors
    let yesOdds = 0.50;

    if (student.performance_tier === "top")      yesOdds += 0.10;
    if (student.performance_tier === "underdog") yesOdds -= 0.10;
    if (student.streak >= 3)                     yesOdds += 0.05;

    if (professor) {
      if (professor.overall_rating >= 4.0) yesOdds -= 0.05;
      if (professor.overall_rating <= 2.0) yesOdds += 0.05;
    }

    const courseLevel = Number(body.courseLevel ?? 100);
    if (courseLevel >= 400) yesOdds -= 0.05;
    if (courseLevel <= 200) yesOdds += 0.05;
    if (body.isMilestone)   yesOdds -= 0.10;

    yesOdds = Math.min(0.90, Math.max(0.10, yesOdds));
    const noOdds = parseFloat((1 - yesOdds).toFixed(4));

    // insert contract
    const { data: created, error: insertError } = await adminClient
      .from("contracts")
      .insert({
        title:             String(body.title),
        description:       String(body.description ?? ""),
        student_id:        body.studentId,
        professor_id:      body.professorId ?? null,
        type,
        threshold,
        course_level:      courseLevel,
        is_milestone:      body.isMilestone ?? false,
        starting_yes_odds: yesOdds,
        starting_no_odds:  noOdds,
        seed_tokens:       500,
        yes_token_pool:    0,
        no_token_pool:     0,
        end_date:          body.endDate ?? null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: created }, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Admin role required." ? 403 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}