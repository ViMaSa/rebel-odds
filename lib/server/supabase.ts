import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  {
    auth: { persistSession: false },
  }
);
