-- MANUAL STEP: Run this in Supabase SQL Editor

-- Enable Row Level Security on all user-facing tables.
-- ENABLE ROW LEVEL SECURITY is idempotent — safe to re-run.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles: authenticated users may read and update only their own profile.
-- (profiles.id is the auth.users id.)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- orders: authenticated users may read only their own orders.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- transactions: authenticated users may read only their own transactions.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- admin_config: no access for anon/authenticated roles.
-- RLS is enabled and NO permissive policies are created, so all access from
-- anon/authenticated is denied. Only the service_role key (which bypasses RLS)
-- can read/write this table.
-- ---------------------------------------------------------------------------
