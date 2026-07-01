-- Add product_url to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS product_url TEXT;
