// app/api/demo/login/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // demo trader uuid
  res.cookies.set("demo_user_id", "df33fddc-fba6-4bb1-abad-078f05e16d4a", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}