-- 1. Secure Secrets Storage
CREATE TABLE IF NOT EXISTS public.account_secrets (
  account_id UUID PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
  secrets JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but intentionally provide NO policies for authenticated users.
-- This ensures only Service Role (backend Edge Functions/API) can SELECT/UPDATE.
ALTER TABLE public.account_secrets ENABLE ROW LEVEL SECURITY;

-- Migrate existing secrets safely
-- Using DO NOTHING to avoid errors if already migrated
INSERT INTO public.account_secrets (account_id, secrets)
SELECT id, integration_secrets FROM public.accounts 
WHERE integration_secrets IS NOT NULL AND integration_secrets != '{}'::jsonb
ON CONFLICT (account_id) DO NOTHING;

-- Drop the vulnerable column from accounts
ALTER TABLE public.accounts DROP COLUMN IF EXISTS integration_secrets;


-- 2. Enforce Foreign Key Constraints (Orphan Prevention)
-- Events
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_account_id_fkey;
ALTER TABLE public.events ADD CONSTRAINT events_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

-- Notification Templates
ALTER TABLE public.notification_templates DROP CONSTRAINT IF EXISTS notification_templates_account_id_fkey;
ALTER TABLE public.notification_templates ADD CONSTRAINT notification_templates_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

-- Account Members
ALTER TABLE public.account_members DROP CONSTRAINT IF EXISTS account_members_account_id_fkey;
ALTER TABLE public.account_members ADD CONSTRAINT account_members_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


-- 3. account_members Role Integrity
ALTER TABLE public.account_members DROP CONSTRAINT IF EXISTS valid_roles;
ALTER TABLE public.account_members ADD CONSTRAINT valid_roles CHECK (role IN ('owner', 'admin', 'member'));


-- 4. 30-Day Auto-Delete Cron (Requires pg_cron extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Removed the unschedule command as it throws an error if the job doesn't exist yet
SELECT cron.schedule(
  'delete_old_events',
  '0 0 * * *', -- Run at midnight every day
  $$ DELETE FROM public.events WHERE created_at < NOW() - INTERVAL '30 days' $$
);


-- 5. RLS Infinite Recursion Bug Fix
-- First, drop the broken policy that only allows viewing self
DROP POLICY IF EXISTS "Users can view account members" ON public.account_members;
-- Also drop the new one if we are re-running
DROP POLICY IF EXISTS "Users can view teammates" ON public.account_members;

-- Create SECURITY DEFINER function to fetch accessible account IDs without recursion
CREATE OR REPLACE FUNCTION public.get_user_account_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_id FROM account_members WHERE user_id = auth.uid();
$$;

-- Create the new, correct policy that allows viewing teammates
CREATE POLICY "Users can view teammates" ON public.account_members
FOR SELECT TO authenticated
USING (
  account_id IN (SELECT public.get_user_account_ids())
);
