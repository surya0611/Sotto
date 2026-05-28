export const APP_NAME = 'Sotto';
export const APP_DESCRIPTION = 'Social proof engine for premium DTC brands';

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    events: 1000,
    domains: 1,
  },
  boutique: {
    name: 'Boutique',
    price: 49,
    events: 50000,
    domains: 3,
  },
  enterprise: {
    name: 'Enterprise',
    price: 149,
    events: 500000,
    domains: 10,
  },
} as const;

export const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: 'home' },
  { label: 'Events', href: '/dashboard/events', icon: 'list' },
  { label: 'Integrations', href: '/dashboard/integrations', icon: 'plug' },
  { label: 'Widget', href: '/dashboard/widget', icon: 'layout' },
  { label: 'Appearance', href: '/dashboard/appearance', icon: 'palette' },
  { label: 'Embed Code', href: '/dashboard/embed', icon: 'code' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'chart' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
] as const;

export const EVENT_SOURCES = ['shopify', 'razorpay', 'typeform', 'google_forms', 'sotto_pixel', 'easebuzz'] as const;
export const EVENT_TYPES = ['purchase', 'signup', 'form_submission', 'impression', 'click', 'conversion'] as const;
