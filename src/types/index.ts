export interface Account {
  id: string;
  name: string;
  domain: string | null;
  widget_config: WidgetConfig;
  integration_secrets: Record<string, string>;
  plan: 'free' | 'boutique' | 'enterprise';
  created_at: string;
}

export interface WidgetConfig {
  theme: WidgetTheme;
  timing: {
    delay_ms: number;
    display_ms: number;
    loop: boolean;
    time_between_ms: number;
  };
  visibility: {
    hide_mobile: boolean;
    hide_desktop: boolean;
  };
  display_mode: 'individual' | 'aggregate';
  aggregate_window: 'day' | 'week';
  frequency_cap: number;
  max_per_page: number;
  event_time_threshold: number;
  page_rules: PageRule[];
  suppress_rules: SuppressRule[];
  conversion_rules: ConversionRule[];
}

export interface WidgetTheme {
  font_family: string;
  text_color: string;
  bg_color: string;
  border_radius: string;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  slide_animation: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
}

export interface PageRule {
  type: 'include' | 'exclude';
  pattern: string;
}

export interface SuppressRule {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with';
  value: string;
}

export interface ConversionRule {
  type: 'url_contains' | 'url_equals';
  value: string;
}

export interface SottoEvent {
  id: string;
  account_id: string;
  source: 'shopify' | 'razorpay' | 'typeform' | 'google_forms' | 'sotto_pixel' | 'custom';
  event_type: 'purchase' | 'signup' | 'form_submission' | 'impression' | 'click' | 'conversion';
  session_id: string | null;
  customer_name: string | null;
  customer_city: string | null;
  customer_region: string | null;
  product_name: string | null;
  product_image_url: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface AccountMember {
  id: string;
  user_id: string;
  account_id: string;
  role: 'admin' | 'operator';
  created_at: string;
}

export interface DashboardStats {
  totalEvents: number;
  impressions: number;
  clickThroughs: number;
  clickThroughRate: number;
}
