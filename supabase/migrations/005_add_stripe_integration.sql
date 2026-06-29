-- Update events source check constraint to include stripe
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_source_check;

ALTER TABLE public.events ADD CONSTRAINT events_source_check 
  CHECK (source IN (
    'shopify', 'razorpay', 'typeform', 'google_forms', 'sotto_pixel', 
    'custom', 'easebuzz', 'cratejoy', '3dcart', 'magento', 'lightspeed', 
    'bigcommerce', 'ecwid', 'thrivecart', 'squarespace', 'jumpseller', 
    'bigcartel', 'woocommerce', 'instamojo', 'cashfree', 'payu', 'dukaan',
    'stripe'
  ));
