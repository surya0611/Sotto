<div align="center">
  
  <br />
  <h3>Sotto - Social Proof Widget & Marketing Infrastructure</h3>
  <p>A high-performance SaaS that integrates with 20+ e-commerce platforms to inject real-time social proof directly into client storefronts.</p>

  <div>
    <a href="https://www.trysotto.in">Live Demo</a>
    <span>&nbsp;·&nbsp;</span>
    <a href="#architecture">Architecture</a>
    <span>&nbsp;·&nbsp;</span>
    <a href="#features">Features</a>
  </div>
</div>

---

## ⚡ Overview

Sotto is a production-ready marketing widget designed to help e-commerce stores increase their conversion rates by displaying real-time purchase data and simulated active visitor counts. 

It consists of two main parts:
1. **The Merchant Dashboard**: A Next.js (App Router) web application where store owners can configure their widget's appearance, set advanced display rules, and connect to over 20 supported e-commerce platforms (Shopify, Stripe, WooCommerce, etc.).
2. **The Injectable Widget**: A lightweight, highly-optimized vanilla JavaScript widget (`widget.min.js`) that clients embed on their storefronts. It utilizes the **Shadow DOM** to render beautiful, animated popups while entirely bypassing the host site's CSS scoping rules to prevent style bleed.

## 📸 Showcase

> **Note to recruiters/reviewers:** *Screenshots and GIFs demonstrating the dashboard configuration and live widget will be embedded here.*

*(Add `dashboard.png` and `widget-demo.gif` to the `.github/assets` folder to display them here!)*

## 🏗️ Architecture & Engineering

Building a 3rd-party widget that runs on *someone else's* website introduces unique engineering challenges that standard web apps don't face. Here is how Sotto solves them:

### 1. Shadow DOM CSS Isolation
When injecting a widget into thousands of different Shopify or WooCommerce stores, inheriting the host site's CSS (like `!important` tags or global `div` margins) will break the widget's layout. Sotto utilizes the **Shadow DOM API** (`attachShadow`) to create an encapsulated DOM tree that is completely impervious to the parent site's CSS, ensuring pixel-perfect rendering across any environment.

### 2. CORS & Apex Domain Edge-Routing
To optimize latency, the widget pings Vercel Edge functions. A major hurdle involved cross-origin preflight requests being blocked when making `POST` requests to an apex domain (`trysotto.in`) due to strict `308 Permanent Redirects` to the `www` subdomain. Sotto's infrastructure handles origin discovery and enforces strict `www.` routing for all generated webhook endpoints to seamlessly bypass Safari and Chrome's strict ITP cross-site tracking protections.

### 3. Secure Webhook Ingestion Engine
Sotto supports webhook ingestion from 20+ platforms. Webhook secrets are not stored alongside standard account metadata; they are isolated in a separate, secure `account_secrets` table with restricted Row Level Security (RLS) policies. The ingestion engine dynamically computes `HMAC SHA-256` signatures to verify the authenticity of incoming purchase events from platforms like Shopify before caching them in the database.

### 4. Frequency Capping & Event Filtering
To prevent spamming end-users, the widget maintains stateful session data via `localStorage` (for impression counts) and implements advanced rule-evaluation logic client-side. The backend API (`/api/widget/events`) aggregates events into rolling windows (e.g., "Trending Store") and performs deduplication to ensure visitors see fresh, relevant data without violating frequency caps.

## 🚀 Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL, Edge Functions, Auth, RLS)
- **Styling**: Vanilla CSS Modules (to maintain high performance and explicit design token control)
- **Deployment**: Vercel
- **Widget Core**: Vanilla JavaScript (`esbuild` for minification and bundling)
- **AI Integration**: OpenAI (for dynamically generated marketing copy on purchase events)

## 💻 Running Locally

To run the Sotto dashboard and API environment locally:

```bash
# Install dependencies
npm install

# Build the lightweight widget bundle (public/widget.min.js)
npm run build:widget

# Start the Next.js development server
npm run dev
```

You will need a Supabase instance running with the appropriate tables (`accounts`, `events`, `account_secrets`) and a `.env.local` file containing your `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
