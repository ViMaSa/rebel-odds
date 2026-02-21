import { headers } from "next/headers";

import { UserRole } from "@/types/contract";

export interface SessionUser {
  id: string;
  role: UserRole;
}

/**
 * Demo auth shim for hackathon speed.
 * Replace with Supabase Auth session lookup in production.
 */
export async function getSessionUser(): Promise<SessionUser> {
  const headerStore = await headers();
  const id = headerStore.get("x-user-id") || "trader-1";
  const roleHeader = headerStore.get("x-user-role");
  const role: UserRole = roleHeader === "admin" ? "admin" : "trader";

  return { id, role };
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (user.role !== "admin") {
    throw new Error("Admin role required.");
  }
  return user;
}
