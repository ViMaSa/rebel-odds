import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client (use in API routes / server actions only)
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
