import { createClient } from '@supabase/supabase-js'

//Admin operations that bypass RLS
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!
)