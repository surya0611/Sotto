-- Update events source check constraint to include easebuzz
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_source_check;

ALTER TABLE public.events ADD CONSTRAINT events_source_check 
  CHECK (source IN ('shopify', 'razorpay', 'typeform', 'google_forms', 'sotto_pixel', 'easebuzz'));
