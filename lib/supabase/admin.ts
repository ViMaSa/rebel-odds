import { createClient } from "@supabase/supabase-js";

export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!, // ✅ must be secret
  {
    auth: { persistSession: false },
  }
);