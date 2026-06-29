# Sotto — Complete Technical Documentation

> **Version**: 0.1.0 (MVP)
> **Stack**: Next.js 16.2.6 · React 19 · Supabase · TypeScript · Vanilla CSS
> **Last Updated**: May 2026

---

## Table of Contents

1. [What Is Sotto?](#1-what-is-sotto)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Pages & Routes](#7-pages--routes)
8. [API Endpoints](#8-api-endpoints)
9. [Widget System](#9-widget-system)
10. [Design System](#10-design-system)
11. [Security Measures](#11-security-measures)
12. [Environment Variables](#12-environment-variables)
13. [Deployment](#13-deployment)
14. [Pricing & Plans](#14-pricing--plans)

---

## 1. What Is Sotto?

Sotto is a **social proof engine for premium DTC (Direct-to-Consumer) brands**. It captures real-time purchase events from platforms like Shopify and Razorpay, then displays elegant, non-intrusive notification popups on a brand's storefront — messages like _"Priya from Mumbai just purchased The Silk Scarf"_.

The goal is to boost conversion rates by showing prospective shoppers that real people are actively buying from the brand.

### Core Value Proposition

- **For Brands**: Install a single `<script>` tag. Sotto handles everything — event ingestion, formatting, delivery, and analytics.
- **For the Founder (You)**: A multi-tenant SaaS platform with a Super Admin dashboard to monitor all onboarded brands, their quotas, and plan usage.

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    Brand's Storefront                     │
│                                                          │
│  <script src="sotto.app/widget.js" data-account-id="…"> │
│                          │                               │
│                  ┌───────▼────────┐                       │
│                  │  Shadow DOM    │                       │
│                  │  Widget UI     │                       │
│                  └───────┬────────┘                       │
└──────────────────────────┼───────────────────────────────┘
                           │ HTTP (fetch)
              ┌────────────▼────────────────┐
              │      Vercel Edge Network     │
              │  (Next.js API Routes)        │
              │                              │
              │  /api/widget/events  (GET)   │  ← Widget polls for events
              │  /api/widget/track   (POST)  │  ← Widget sends telemetry
              │  /api/webhooks/*     (POST)  │  ← Shopify/Razorpay/etc push events
              └────────────┬────────────────┘
                           │
              ┌────────────▼────────────────┐
              │     Supabase (PostgreSQL)    │
              │                              │
              │  accounts                    │
              │  events                      │
              │  account_members             │
              │  auth.users (managed)        │
              └─────────────────────────────┘
```

### Data Flow

1. **Ingestion**: A customer completes a purchase on a brand's Shopify store. Shopify fires a webhook to `/api/webhooks/shopify`. Sotto verifies the HMAC signature, extracts the customer name/city/product, and inserts an `event` row.
2. **Delivery**: The widget script on the brand's storefront polls `/api/widget/events` every 30 seconds. The API checks frequency caps, applies page rules, and returns the most recent event formatted as a popup message.
3. **Telemetry**: When a shopper sees the widget (impression) or clicks it (click), the widget fires a POST to `/api/widget/track`, recording telemetry events for analytics.

---

## 3. Tech Stack & Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.6 | React framework with App Router, server components, and API routes |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | React DOM renderer |
| `@supabase/ssr` | 0.10.3 | Server-side Supabase client for cookie-based auth in Next.js |
| `@supabase/supabase-js` | 2.106.1 | Supabase client for database queries and admin operations |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `typescript` | ^5 | Type safety |
| `eslint` | ^9 | Code linting |
| `eslint-config-next` | 16.2.6 | Next.js-specific lint rules |
| `@types/node` | ^20 | Node.js type definitions |
| `@types/react` | ^19 | React type definitions |

### Key Design Decisions

- **No Tailwind CSS** — The entire design system is hand-crafted in vanilla CSS with CSS custom properties (variables) for a premium, bespoke aesthetic.
- **No ORM** — Direct Supabase PostgREST queries (HTTP-based, no raw Postgres connections). This eliminates the need for connection pooling.
- **No external UI library** — All components (buttons, cards, modals, tables) are built from scratch.

---

## 4. Project Structure

```
sotto/
├── public/
│   └── widget.js                    # Standalone embed script (served via CDN)
│
├── src/
│   ├── app/
│   │   ├── globals.css              # Complete design system (1274 lines)
│   │   ├── layout.tsx               # Root layout (Inter + Outfit fonts, metadata)
│   │   ├── page.tsx                 # Landing redirect → /dashboard
│   │   │
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── layout.tsx           # Centered auth layout wrapper
│   │   │   ├── login/page.tsx       # Login page (client component)
│   │   │   └── signup/
│   │   │       ├── page.tsx         # Signup page (client component)
│   │   │       └── actions.ts       # Server action for secure account creation
│   │   │
│   │   ├── auth/
│   │   │   └── callback/route.ts    # OAuth callback handler
│   │   │
│   │   ├── (dashboard)/             # Dashboard route group
│   │   │   ├── layout.tsx           # Server component — fetches user/account
│   │   │   ├── dashboard-shell.tsx  # Client component — sidebar, topbar, nav
│   │   │   └── dashboard/
│   │   │       ├── page.tsx         # Overview (stats + quick-start checklist)
│   │   │       ├── events/
│   │   │       │   ├── page.tsx     # Events log table
│   │   │       │   └── export-button.tsx  # CSV export button (client)
│   │   │       ├── integrations/page.tsx  # Integration cards
│   │   │       ├── widget/page.tsx        # Widget config
│   │   │       ├── appearance/page.tsx    # Theme editor
│   │   │       ├── embed/page.tsx         # Embed snippet display
│   │   │       ├── analytics/page.tsx     # Analytics dashboard
│   │   │       └── settings/page.tsx      # Account settings
│   │   │
│   │   ├── (admin)/                 # Super Admin route group
│   │   │   ├── layout.tsx           # Admin layout (email-gated access)
│   │   │   └── admin/page.tsx       # Platform overview table
│   │   │
│   │   └── api/
│   │       ├── health/route.ts      # Health check endpoint
│   │       ├── webhooks/
│   │       │   ├── shopify/route.ts     # Shopify webhook receiver
│   │       │   ├── razorpay/route.ts    # Razorpay webhook receiver
│   │       │   ├── typeform/route.ts    # Typeform webhook receiver
│   │       │   └── google_forms/route.ts # Google Forms webhook receiver
│   │       └── widget/
│   │           ├── events/route.ts  # Widget event feed API
│   │           └── track/route.ts   # Widget telemetry API
│   │
│   ├── lib/
│   │   ├── constants.ts             # App name, plans, nav items, event types
│   │   ├── utils.ts                 # cn(), formatDate(), formatRelativeTime(), etc.
│   │   ├── geolocation.ts           # IP → city/region via ipapi.co
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client
│   │       ├── server.ts            # Server Supabase client (cookie-based)
│   │       └── middleware.ts         # Session refresh + route protection logic
│   │
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces (Account, Event, etc.)
│   │
│   ├── proxy.ts                     # Next.js 16 proxy (auth middleware)
│   └── middleware.ts                # [DELETED — replaced by proxy.ts]
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Full database schema + RLS policies
│
├── scripts/
│   ├── force-create-admin.mjs       # Admin user bootstrapping script
│   ├── cleanup-user.mjs             # User deletion utility
│   └── add-external-id.mjs          # DB migration helper (placeholder)
│
├── next.config.ts                   # Security headers + CSP
├── .env.local                       # Environment variables (gitignored)
├── .env.local.example               # Template for new developers
├── .gitignore                       # Ignores .env*, node_modules, .next
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies and scripts
```

---

## 5. Database Schema

All tables live in the `public` schema on Supabase (PostgreSQL).

### `accounts`

The core multi-tenant table. Each brand is one account.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | Primary key |
| `name` | TEXT | — | Brand display name |
| `domain` | TEXT | NULL | Registered website domain (used for CORS validation) |
| `widget_config` | JSONB | See below | Full widget configuration object |
| `plan` | TEXT | `'free'` | Pricing tier: `free`, `boutique`, or `enterprise` |
| `created_at` | TIMESTAMPTZ | `now()` | Account creation timestamp |

**Default `widget_config`:**
```json
{
  "theme": {
    "font_family": "inherit",
    "text_color": "#1a1a1a",
    "bg_color": "#ffffff",
    "border_radius": "8px"
  },
  "display_mode": "individual",
  "aggregate_window": "week",
  "frequency_cap": 5,
  "page_rules": [],
  "suppress_rules": []
}
```

### `events`

Every webhook payload, widget impression, and click is stored here.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `account_id` | UUID | Foreign key → `accounts.id` (CASCADE) |
| `source` | TEXT | `shopify`, `razorpay`, `typeform`, `google_forms`, `sotto_pixel`, `custom`, `easebuzz`, `cratejoy`, `3dcart`, `magento`, `lightspeed`, `bigcommerce`, `ecwid`, `thrivecart`, `squarespace`, `jumpseller`, `bigcartel`, `woocommerce`, `instamojo`, `cashfree`, `payu`, `dukaan` |
| `event_type` | TEXT | `purchase`, `signup`, `form_submission`, `impression`, `click`, or `conversion` |
| `session_id` | TEXT | Shopper session ID (widget) or webhook dedup ID (webhooks) |
| `customer_name` | TEXT | Customer's name (from webhook payload) |
| `customer_city` | TEXT | Customer's city (from payload or IP geolocation) |
| `customer_region` | TEXT | Customer's region/state |
| `product_name` | TEXT | Product title (Shopify only) |
| `raw_payload` | JSONB | Full original webhook payload (for debugging) |
| `created_at` | TIMESTAMPTZ | Event timestamp |

### `account_members`

Links Supabase auth users to accounts (multi-user support).

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → `auth.users.id` (CASCADE) |
| `account_id` | UUID | Foreign key → `accounts.id` (CASCADE) |
| `role` | TEXT | `admin` or `operator` |
| `created_at` | TIMESTAMPTZ | Membership timestamp |
| | | UNIQUE constraint on (`user_id`, `account_id`) |

### Indexes

```sql
idx_events_account_id      ON events(account_id)
idx_events_created_at      ON events(created_at DESC)
idx_events_account_type    ON events(account_id, event_type)
idx_events_session         ON events(session_id) WHERE session_id IS NOT NULL
idx_account_members_user   ON account_members(user_id)
idx_account_members_account ON account_members(account_id)
```

### Row Level Security (RLS)

RLS is **enabled on all three tables**. Policies enforce strict data isolation between brands:

| Table | Operation | Policy |
|---|---|---|
| `accounts` | SELECT | User can only see accounts they're a member of |
| `accounts` | UPDATE | User can only update accounts they're a member of |
| `events` | SELECT | User can only see events for their own account |
| `events` | INSERT | Service role can insert (webhooks use service key) |
| `account_members` | SELECT | User can only see their own memberships |
| `account_members` | INSERT | Service role can insert (signup uses server action) |

---

## 6. Authentication & Authorization

### Auth Flow

Sotto uses **Supabase Auth** with email/password authentication.

1. **Signup**: User fills out brand name, email, password → `supabase.auth.signUp()` creates the auth user → A **Next.js Server Action** (`signup/actions.ts`) uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and create the `accounts` row + `account_members` link.
2. **Login**: User enters email/password → `supabase.auth.signInWithPassword()` → redirects to `/dashboard`.
3. **Session Management**: The `proxy.ts` file runs on every request. It calls `supabase.auth.getUser()` to refresh the JWT and manage cookies. Unauthenticated users are redirected to `/login`.

### Route Protection

| Route Pattern | Access |
|---|---|
| `/login`, `/signup` | Public (redirects to `/dashboard` if already logged in) |
| `/dashboard/*` | Authenticated users only |
| `/admin` | Authenticated + email must match `ADMIN_EMAIL` env var |
| `/api/*` | Public (protected by HMAC signatures or domain validation) |

### Super Admin

The `/admin` route is protected by a server-side email check in `(admin)/layout.tsx`. Only the email stored in `process.env.ADMIN_EMAIL` can access this route. All other authenticated users are silently redirected to `/dashboard`.

---

## 7. Pages & Routes

### Auth Pages

| Route | File | Type | Description |
|---|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Client | Email/password login form with error handling and loading state |
| `/signup` | `(auth)/signup/page.tsx` | Client | Brand name + email + password registration form |
| `/auth/callback` | `auth/callback/route.ts` | API Route | OAuth code exchange handler (for future social logins) |

### Dashboard Pages

All dashboard pages share a common layout with a **fixed sidebar** (260px) and a **sticky topbar** with backdrop blur.

| Route | File | Type | Description |
|---|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | Server | Welcome message, 4 stats cards (Total Events, Impressions, Click-throughs, CTR), Quick Start checklist, Recent Events feed |
| `/dashboard/events` | `dashboard/events/page.tsx` | Server | Full events log table (last 100 events) with columns for Event Type, Source, Customer, Location, Product, Time. Includes CSV Export button |
| `/dashboard/integrations` | `dashboard/integrations/page.tsx` | Server | Cards for Shopify, Razorpay, Typeform, and Google Forms — each showing connection status |
| `/dashboard/widget` | `dashboard/widget/page.tsx` | Server | Widget configuration — display mode, frequency caps, page rules |
| `/dashboard/appearance` | `dashboard/appearance/page.tsx` | Server | Theme editor — fonts, colors, border radius |
| `/dashboard/embed` | `dashboard/embed/page.tsx` | Server | Copy-paste `<script>` snippet for installation |
| `/dashboard/analytics` | `dashboard/analytics/page.tsx` | Server | 5 stats cards — Total Events, Impressions, Clicks, Conversions, CTR. Queries live data from Supabase |
| `/dashboard/settings` | `dashboard/settings/page.tsx` | Server | Account management and billing (placeholder) |

### Admin Pages

| Route | File | Type | Description |
|---|---|---|---|
| `/admin` | `(admin)/admin/page.tsx` | Server | Platform Overview — table of all onboarded brands showing name, domain, plan, event quota usage (with progress bars), and onboard date. Uses service role to bypass RLS |

### Dashboard Shell Architecture

The dashboard uses a **Server Component → Client Component** composition pattern:

1. `(dashboard)/layout.tsx` (Server) — Fetches user and account data from Supabase using the server client.
2. `(dashboard)/dashboard-shell.tsx` (Client) — Receives user/account as props. Renders the interactive sidebar (with mobile hamburger menu), topbar, active link highlighting, and logout button.

---

## 8. API Endpoints

### Health Check

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | None | Returns `{ status: 'ok', timestamp, version }` |

### Webhook Receivers

All webhook endpoints use the **Supabase Service Role Key** to insert events, bypassing RLS.

| Endpoint | Method | Auth | Source | Description |
|---|---|---|---|---|
| `/api/webhooks/shopify` | POST | HMAC-SHA256 (`x-shopify-hmac-sha256`) | Shopify | Receives `orders/create` webhooks. Extracts customer name, city, product title. Falls back to IP geolocation if city is missing. Deduplicates via `x-shopify-webhook-id` |
| `/api/webhooks/razorpay` | POST | HMAC-SHA256 (`x-razorpay-signature`) | Razorpay | Receives `payment.captured` events. Extracts customer name and city from payment notes. Deduplicates via `x-razorpay-event-id` |
| `/api/webhooks/typeform` | POST | HMAC-SHA256 (`Typeform-Signature`) | Typeform | Receives form submission webhooks. Extracts customer name from the first text answer. Deduplicates via `event_id` from payload |
| `/api/webhooks/google_forms` | POST | Shared secret (`x-sotto-secret`) | Google Forms | Receives `{ name, city }` payloads from Google Apps Script. Deduplicates via SHA-256 hash of the payload |

**Webhook Security Model:**
1. Each brand stores their platform-specific webhook secret in `accounts.integration_secrets` (JSONB).
2. When a webhook arrives, the endpoint fetches the secret for that `account_id`, generates the expected HMAC, and compares it to the header. Mismatches return `401`.
3. All webhooks check for duplicate delivery using the `session_id` column — if an event with the same webhook ID already exists, the endpoint returns `200 OK` without inserting.

### Widget APIs

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/widget/events` | GET | Domain CORS validation | Returns the next event to display in the widget. Checks frequency caps, applies page rules, and formats the message. Caches responses for 30s via `Cache-Control` |
| `/api/widget/track` | POST | Domain CORS validation | Records `impression`, `click`, or `conversion` telemetry events from the widget |

**Widget API Security:**
- Both endpoints validate the `Origin` or `Referer` header against the brand's registered `domain` in the database.
- Requests from unregistered domains receive a `403 Forbidden` response.
- `localhost` is whitelisted for development.
- CORS headers are set dynamically.

---

## 9. Widget System

### Overview

The widget (`public/widget.js`) is a **242-line vanilla JavaScript file** that brands embed on their storefront. It is completely self-contained with zero external dependencies.

### Installation

Brands add this single line to their site:

```html
<script src="https://your-sotto-domain.com/widget.js" data-account-id="ACCOUNT_UUID" async></script>
```

### How It Works

1. **Initialization**: The script reads `data-account-id` from its own `<script>` tag and determines the API base URL from the script's `src` attribute.
2. **Session Management**: Creates or reads a `sotto_session_id` cookie (UUID v4, 30-minute expiry). This identifies the shopper across page loads for frequency capping.
3. **Polling**: After a 2-second initial delay, the widget polls `/api/widget/events?account_id=…&session_id=…` every 30 seconds.
4. **Rendering**: If the API returns an event (not `skip: true`), the widget creates a popup inside a **Shadow DOM** — completely isolated from the host site's CSS.
5. **Theming**: The widget applies the brand's custom theme (background color, text color, font family, border radius) via CSS custom properties.
6. **Animation**: The popup slides in from below with a 400ms CSS transition, displays for 6 seconds, then fades out.
7. **Telemetry**: An `impression` event is tracked when the popup appears. A `click` event is tracked if the shopper clicks it.

### Shadow DOM Isolation

The widget uses a **closed Shadow DOM** (`attachShadow({ mode: 'closed' })`), meaning:
- The host site's CSS cannot affect the widget's appearance.
- The host site's JavaScript cannot access the widget's internal DOM.
- The widget cannot accidentally break the host site's layout.

### Frequency Capping

The API checks how many `impression` events exist for the current `session_id`. If the count exceeds the brand's configured `frequency_cap` (default: 5), the API returns `{ skip: true }` and the widget stays hidden.

---

## 10. Design System

The design system is defined in `globals.css` (1,274 lines) and follows a **premium Alabaster luxury aesthetic**.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-deep` | `hsl(40, 20%, 98%)` | Page background (warm cream) |
| `--bg-base` | `hsl(40, 25%, 96%)` | Sidebar background |
| `--bg-surface` | `#ffffff` | Cards, inputs, modals |
| `--accent` | `hsl(27, 40%, 40%)` | Italian Walnut — primary action color |
| `--accent-hover` | `hsl(27, 40%, 30%)` | Darker walnut for hover states |
| `--text-primary` | `hsl(30, 10%, 15%)` | Deep espresso — headings and body |
| `--text-muted` | `hsl(30, 8%, 60%)` | Secondary/placeholder text |
| `--success` | `hsl(145, 40%, 35%)` | Green accents |
| `--error` | `hsl(0, 60%, 45%)` | Error states |

### Typography

| Token | Value |
|---|---|
| `--font-body` | SF Pro Text, system stack |
| `--font-heading` | SF Pro Display, system stack |
| `--font-mono` | SF Mono, JetBrains Mono |

### Component Library

The CSS defines complete styles for:
- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg`, `.btn-icon`
- **Inputs**: `.input`, `.input-group`, `.input-label`, `.textarea`
- **Cards**: `.card`, `.card-hover`, `.card-glow`, `.card-header`, `.card-footer`
- **Badges**: `.badge-default`, `.badge-accent`, `.badge-success`, `.badge-warning`, `.badge-error`
- **Tables**: `.table-container`, `.table` with hover rows
- **Modals**: `.modal-overlay` (blur backdrop), `.modal`, `.modal-header`, `.modal-body`
- **Toasts**: `.toast-container`, `.toast-success`, `.toast-error`
- **Stats Cards**: `.stats-grid`, `.stats-card`, `.stats-card-value`
- **Empty States**: `.empty-state`, `.empty-state-icon`
- **Checklists**: `.checklist`, `.checklist-item`, `.checklist-check`
- **Skeleton Loaders**: `.skeleton`, `.skeleton-text`, `.skeleton-heading`
- **Spinners**: `.spinner`, `.spinner-lg`

### Layout System

| Component | Description |
|---|---|
| `.layout-dashboard` | Flexbox: sidebar (fixed 260px) + main content |
| `.layout-main` | Main area with `margin-left: 260px` |
| `.layout-content` | Content area, max-width 1280px, 24px padding |
| `.layout-auth` | Centered flex container for login/signup |
| `.sidebar` | Fixed left panel, full height, with nav and user footer |
| `.topbar` | Sticky top bar with backdrop blur (`blur(12px)`) |

### Animations

| Class | Effect |
|---|---|
| `.animate-fade-in` | `fadeIn 300ms ease-out` |
| `.animate-slide-up` | `slideInUp 300ms ease-out` |
| `@keyframes scaleIn` | Used for modal entrance |
| `@keyframes shimmer` | Used for skeleton loader shimmer |

### Responsive Breakpoints

- **768px**: Sidebar collapses off-screen (slide-in on hamburger tap), stats grid becomes 2-column
- **480px**: Stats grid becomes 1-column, content padding shrinks to 16px

---

## 11. Security Measures

### Application-Level

| Measure | Implementation |
|---|---|
| **Webhook HMAC Verification** | All 4 webhook endpoints verify signatures before processing payloads |
| **Webhook Deduplication** | Unique webhook IDs are stored in `session_id` to prevent duplicate event insertion from retries |
| **XSS Sanitization** | Customer names, cities, and product names are stripped of `<>"'&` characters before being sent to the widget |
| **CORS Domain Validation** | Widget APIs validate the `Origin`/`Referer` header against the brand's registered domain |
| **RLS (Row Level Security)** | All database tables enforce row-level access — Brand A can never see Brand B's data |
| **Server Actions for Signup** | Account creation uses a Next.js Server Action with the service role key, bypassing RLS securely on the server |
| **Super Admin Email Gate** | `/admin` route checks `process.env.ADMIN_EMAIL` server-side before rendering |

### HTTP Headers (via `next.config.ts`)

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` (prevents clickjacking) |
| `X-Content-Type-Options` | `nosniff` (prevents MIME sniffing) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | Locked to `'self'` + `*.supabase.co` |

### Infrastructure

| Measure | Status |
|---|---|
| **Environment Variables** | All secrets are server-only (no `NEXT_PUBLIC_` prefix). `.env*` is in `.gitignore` |
| **Connection Model** | Uses Supabase's PostgREST HTTP API — no raw Postgres connections, inherent connection pooling |
| **Widget Caching** | `Cache-Control: s-maxage=30, stale-while-revalidate=60` on event feed responses |

### Manual (Dashboard Settings)

These require configuration in your Vercel/Supabase dashboards:

- **Vercel Spend Limit**: Set a monthly cap (e.g., $20) under Settings → Billing
- **Supabase Spend Cap**: Toggle ON under Settings → Billing to prevent surprise bills
- **Auth Token Hardening**: Set JWT expiry to 3600s, enable refresh token rotation

---

## 12. Environment Variables

```bash
# ─── Public (safe for browser) ───────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                       # Read-only, RLS-protected
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Server-Only Secrets ─────────────────────────────────
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # Full DB access — NEVER expose to browser
ADMIN_EMAIL=surya.psingh116@gmail.com

# ─── Webhooks (per-brand secrets stored in DB) ───────────
# SHOPIFY_WEBHOOK_SECRET=           # Legacy — now stored per-account
# RAZORPAY_WEBHOOK_SECRET=
# TYPEFORM_WEBHOOK_SECRET=

# ─── Geolocation ─────────────────────────────────────────
# IPAPI_KEY=                        # Optional — ipapi.co free tier works without key

# ─── Stripe (Week 6 — not yet implemented) ───────────────
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## 13. Deployment

### Current State

The app is **development-ready** and runs locally via `npm run dev`. Production deployment to Vercel is planned but not yet executed.

### Deployment Checklist

1. Push to GitHub
2. Connect repository to Vercel
3. Set all environment variables in Vercel dashboard
4. Configure custom domain (e.g., `app.sotto.in`)
5. Set Vercel spend limits and enable Attack Challenge Mode
6. Serve `widget.js` from a CDN URL (e.g., `cdn.sotto.in/v1/widget.js`)

### Build Output

```
Route (app)
├── ○  /                    (Static — redirect)
├── ○  /login               (Static — auth form)
├── ○  /signup              (Static — auth form)
├── ƒ  /dashboard           (Dynamic — fetches user data)
├── ƒ  /dashboard/events    (Dynamic — fetches events)
├── ƒ  /dashboard/analytics (Dynamic — fetches stats)
├── ƒ  /admin               (Dynamic — fetches all accounts)
├── ƒ  /api/webhooks/*      (Dynamic — webhook receivers)
├── ƒ  /api/widget/*        (Dynamic — widget APIs)
└── ƒ  /api/health          (Dynamic — health check)
```

---

## 14. Pricing & Plans

| Feature | Free | Boutique ($49/mo) | Enterprise ($149/mo) |
|---|---|---|---|
| Events/month | 1,000 | 50,000 | 500,000 |
| Domains | 1 | 3 | 10 |
| Price | $0 | $49 | $149 |

Plan limits are defined in `src/lib/constants.ts` and enforced in the Super Admin dashboard's quota progress bars. Stripe billing integration is planned for Week 6.

---

## Appendix: npm Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start development server with hot reload |
| `build` | `next build` | Create optimized production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint checks |
