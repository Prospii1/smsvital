-- MANUAL STEP: Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.payments (
  reference text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount_expected numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
-- service_role bypasses RLS; no permissive policies needed
