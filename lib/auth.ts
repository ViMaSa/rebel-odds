// lib/auth.ts
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

  return { id, role: "trader", username: "demo_trader" };
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not authenticated.");
  if (user.role !== "admin") throw new Error("Admin role required.");
  return user;
}
