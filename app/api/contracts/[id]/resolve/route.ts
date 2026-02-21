import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { resolveContract } from "@/lib/market";
import { ContractOutcome } from "@/types/contract";

function parseOutcome(value: string): ContractOutcome | null {
  if (value === "yes" || value === "no") {
    return value;
  }
  return null;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const outcome = parseOutcome(String(body.outcome ?? ""));
    if (!outcome) {
      return NextResponse.json({ ok: false, error: "Outcome must be yes|no." }, { status: 400 });
    }

    const contract = await resolveContract(id, outcome);
    return NextResponse.json({ ok: true, data: contract });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 },
    );
  }
}
