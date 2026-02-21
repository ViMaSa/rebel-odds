import { NextResponse } from "next/server";

const DEMO_USER_ID = "df33fddc-fba6-4bb1-abad-078f05e16d4a";

export async function POST() {
  const res = NextResponse.json({ ok: true, userId: DEMO_USER_ID });

  // cookie name must match what getSessionUser() reads
  res.cookies.set("demo_user_id", DEMO_USER_ID, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
