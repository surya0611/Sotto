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
  visibility?: {
    hide_mobile: boolean;
    hide_desktop: boolean;
  };
  display_mode: 'individual' | 'aggregate';
  aggregate_window: 'day' | 'week';
  frequency_cap: number;
  max_per_page: number;
  event_time_threshold: number;
  advanced_rules?: AdvancedRule[];
  suppress_rules: SuppressRule[];
  conversion_rules: ConversionRule[];
  utm?: {
    enabled: boolean;
    source: string;
    medium: string;
    campaign?: string;
  };
}

export interface WidgetTheme {
  theme_preset?: 'default' | 'glassmorphism' | 'neumorphism' | 'dark' | 'playful' | 'minimalist';
  hover_animation?: 'none' | 'lift' | 'glow' | 'scale';
  font_family: string;
  text_color: string;
  bg_color: string;
  border_radius: number;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  slide_animation: 'slide-up' | 'slide-in-left' | 'slide-in-right';
}

export interface RuleCondition {
  variable: 'url_path' | 'url_host' | 'url_parameter' | 'home_page' | 'mobile_browser';
  operator: 'equals' | 'not_equals' | 'contains' | 'does_not_contain' | 'begins_with';
  value: string;
}

export interface RuleAction {
  setting: 'notifications' | 'do_not_show_template' | 'only_show_template' | 'max_per_page' | 'initial_delay' | 'display_interval' | 'position' | 'mobile_position' | 'loop_notifications' | 'links_open_new_tab' | 'entire_notification_clickable';
  value: string | number | boolean;
}

export interface AdvancedRule {
  id: string;
  title: string;
  description: string;
  conditions: RuleCondition[];
  action: RuleAction;
  is_active: boolean;
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

export interface NotificationTemplate {
  id: string;
  account_id: string;
  name: string;
  event_type: 'purchase' | 'review' | 'signup' | 'custom';
  template_string: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
