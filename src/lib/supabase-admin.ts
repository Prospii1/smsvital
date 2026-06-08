import { createClient } from "@supabase/supabase-js";

// Server-only — never import this from a client component.
// Uses service_role key which bypasses Row Level Security.
function makeAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const supabaseAdmin = makeAdmin();
