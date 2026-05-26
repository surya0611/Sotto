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
  display_mode: 'individual' | 'aggregate';
  aggregate_window: 'day' | 'week';
  frequency_cap: number;
  page_rules: PageRule[];
  suppress_rules: SuppressRule[];
}

export interface WidgetTheme {
  font_family: string;
  text_color: string;
  bg_color: string;
  border_radius: string;
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

export interface SottoEvent {
  id: string;
  account_id: string;
  source: 'shopify' | 'razorpay' | 'typeform' | 'google_forms' | 'sotto_pixel';
  event_type: 'purchase' | 'signup' | 'form_submission' | 'impression' | 'click' | 'conversion';
  session_id: string | null;
  customer_name: string | null;
  customer_city: string | null;
  customer_region: string | null;
  product_name: string | null;
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
