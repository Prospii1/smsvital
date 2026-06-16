-- MANUAL STEP: Run this in Supabase SQL Editor
--
-- Problem found during audit: profiles_update_own (from 20260611_rls.sql) lets
-- any authenticated user UPDATE their own profiles row to ANY value, including
-- balance — it only restricts which row can be touched, not what it's set to.
-- The browser client (anon key) is used for this update in Providers.tsx, so
-- any logged-in user could open devtools and set their own balance directly.
--
-- Fix: (1) a BEFORE UPDATE trigger that rejects any change to `balance` unless
-- performed by service_role (i.e. only our server-side API routes / RPCs can
-- move balance — never a direct client write). (2) track lifetime_deposited
-- and make credit_balance assert balance never exceeds it.

-- ---------------------------------------------------------------------------
-- 1. Add lifetime_deposited — total real money ever deposited, increased only
--    by credit_balance(..., reason => 'deposit'). Refunds never touch this.
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lifetime_deposited numeric NOT NULL DEFAULT 0;

-- Backfill: assume existing balance was legitimately deposited so current
-- users aren't immediately blocked by the new invariant.
UPDATE public.profiles
SET lifetime_deposited = balance
WHERE lifetime_deposited = 0 AND balance > 0;

-- ---------------------------------------------------------------------------
-- 2. Trigger: block any write to `balance` that isn't performed by service_role.
--    service_role bypasses RLS entirely but NOT triggers, so this is the layer
--    that actually stops client-side balance writes — RLS alone can't restrict
--    column-level changes on an UPDATE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- auth.role() is Supabase's helper exposing the PostgREST request role:
  -- 'anon' / 'authenticated' for client requests, 'service_role' for our
  -- server-side supabaseAdmin client. Only service_role may change balance
  -- or lifetime_deposited; a direct client write to either is rejected.
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF NEW.balance IS DISTINCT FROM OLD.balance THEN
      RAISE EXCEPTION 'balance can only be changed by server-side operations';
    END IF;
    IF NEW.lifetime_deposited IS DISTINCT FROM OLD.lifetime_deposited THEN
      RAISE EXCEPTION 'lifetime_deposited can only be changed by server-side operations';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_balance_trigger ON public.profiles;
CREATE TRIGGER guard_profile_balance_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_balance();

-- ---------------------------------------------------------------------------
-- 3. credit_balance — add `reason` param ('deposit' | 'refund', default
--    'refund' for backward compatibility with existing call sites that don't
--    pass it). Only 'deposit' increases lifetime_deposited. Every credit
--    (deposit or refund) is rejected if it would push balance above
--    lifetime_deposited — the hard invariant requested.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_balance(
  user_id uuid,
  amount numeric,
  reason text DEFAULT 'refund'
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance numeric;
  new_lifetime numeric;
BEGIN
  IF reason = 'deposit' THEN
    INSERT INTO profiles (id, balance, lifetime_deposited)
      VALUES (user_id, amount, amount)
      ON CONFLICT (id) DO UPDATE
        SET balance = profiles.balance + amount,
            lifetime_deposited = profiles.lifetime_deposited + amount
      RETURNING balance, lifetime_deposited INTO new_balance, new_lifetime;
  ELSE
    INSERT INTO profiles (id, balance, lifetime_deposited)
      VALUES (user_id, amount, 0)
      ON CONFLICT (id) DO UPDATE
        SET balance = profiles.balance + amount
      RETURNING balance, lifetime_deposited INTO new_balance, new_lifetime;
  END IF;

  IF new_balance > new_lifetime THEN
    RAISE EXCEPTION 'balance_exceeds_lifetime_deposit: balance % would exceed lifetime_deposited % for user %', new_balance, new_lifetime, user_id;
  END IF;

  RETURN new_balance;
END;
$$;
