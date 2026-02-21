import { NextResponse } from "next/server";

import { getContractById } from "@/lib/market";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const record = getContractById(id);
  if (!record) {
    return NextResponse.json({ ok: false, error: "Contract not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data: record });
}
