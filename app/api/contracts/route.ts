import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { createContract, listContracts } from "@/lib/market";
import { ContractType } from "@/types/contract";

function parseContractType(value: string): ContractType | null {
  if (value === "gpa" || value === "course" || value === "credits") {
    return value;
  }
  return null;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: listContracts(),
    disclaimer: "Paper trading only. Rebel Tokens have no cash value.",
  });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    const type = parseContractType(String(body.type ?? ""));
    if (!type) {
      return NextResponse.json({ ok: false, error: "Invalid contract type." }, { status: 400 });
    }

    const threshold = Number(body.threshold);
    if (!Number.isFinite(threshold)) {
      return NextResponse.json({ ok: false, error: "Invalid threshold." }, { status: 400 });
    }

    const created = createContract({
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      studentId: String(body.studentId ?? ""),
      type,
      threshold,
      yesPool: body.yesPool ? Number(body.yesPool) : undefined,
      noPool: body.noPool ? Number(body.noPool) : undefined,
      endDate: String(body.endDate ?? ""),
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Admin role required." ? 403 : 400;
    return NextResponse.json(
      { ok: false, error: message },
      { status },
    );
  }
}
