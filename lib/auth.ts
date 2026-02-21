import { cookies } from "next/headers";

export type SessionUser = {
  id: string; // uuid
  role?: "admin" | "trader";
  username?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get("demo_user_id")?.value;

  if (!id) return null;

  // Keep it minimal; use DB to resolve username if you want.
  return { id, role: "trader", username: "demo_trader" };
}
