-- Drop the insecure policy that allows anonymous inserts
DROP POLICY IF EXISTS "Service role can insert events" ON public.events;
