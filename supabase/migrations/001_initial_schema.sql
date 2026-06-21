-- Sotto MVP — Initial Database Schema
-- Run this in Supabase SQL Editor

-- Accounts table
CREATE TABLE public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  widget_config JSONB DEFAULT '{
    "theme": {
      "font_family": "inherit",
      "text_color": "#1a1a1a",
      "bg_color": "#ffffff",
      "border_radius": "8px",
      "position": "bottom-left",
      "slide_animation": "slide-up"
    },
    "timing": {
      "delay_ms": 3000,
      "display_ms": 4000,
      "loop": false,
      "time_between_ms": 8000
    },
    "visibility": {
      "hide_mobile": false,
      "hide_desktop": false
    },
    "display_mode": "individual",
    "aggregate_window": "week",
    "frequency_cap": 5,
    "max_per_page": 20,
    "event_time_threshold": 14,
    "page_rules": [],
    "suppress_rules": [],
    "conversion_rules": []
  }'::jsonb,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'boutique', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('shopify', 'razorpay', 'typeform', 'google_forms', 'sotto_pixel', 'custom')),
  event_type TEXT NOT NULL CHECK (event_type IN ('purchase', 'signup', 'form_submission', 'impression', 'click', 'conversion')),
  session_id TEXT,
  customer_name TEXT,
  customer_city TEXT,
  customer_region TEXT,
  product_name TEXT,
  product_image_url TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Account members table (links auth users to accounts)
CREATE TABLE public.account_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, account_id)
);

-- Indexes for query performance
CREATE INDEX idx_events_account_id ON public.events(account_id);
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX idx_events_account_type ON public.events(account_id, event_type);
CREATE INDEX idx_events_session ON public.events(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_account_members_user ON public.account_members(user_id);
CREATE INDEX idx_account_members_account ON public.account_members(account_id);

-- Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own account data
CREATE POLICY "Users can view own accounts"
  ON public.accounts FOR SELECT
  USING (id IN (SELECT account_id FROM public.account_members WHERE user_id = auth.uid()));



CREATE POLICY "Users can view own events"
  ON public.events FOR SELECT
  USING (account_id IN (SELECT account_id FROM public.account_members WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert events"
  ON public.events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own memberships"
  ON public.account_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert memberships"
  ON public.account_members FOR INSERT
  WITH CHECK (true);
