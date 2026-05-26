-- Add integration_secrets JSONB column to accounts table
-- This will securely store webhook secrets (e.g. Shopify HMAC keys, Razorpay secrets)
-- Default to an empty object

ALTER TABLE public.accounts 
ADD COLUMN integration_secrets JSONB DEFAULT '{}'::jsonb;

-- Example structure that will be stored:
-- {
--   "shopify_secret": "hsq_...",
--   "razorpay_secret": "sk_..."
-- }
