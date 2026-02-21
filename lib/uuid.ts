// lib/uuid.ts
// Accepts any 8-4-4-4-12 hex UUID (Postgres uuid-compatible),
// WITHOUT enforcing RFC4122 version bits (zod's .uuid() enforces versions).
const UUID_LAX_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuidLike(value: string): boolean {
  return UUID_LAX_REGEX.test(value.trim());
}

export function assertUuidLike(value: string, label = "id"): string {
  const v = value.trim();
  if (!isUuidLike(v)) throw new Error(`Invalid UUID: ${value}`);
  return v;
}