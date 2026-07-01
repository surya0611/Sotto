-- Add product_url and product_image_url to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS product_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS product_image_url TEXT;
