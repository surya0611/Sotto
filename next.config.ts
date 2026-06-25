import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    // We allow unsafe-inline for styles/scripts in the MVP but lock down default-src
    value: "default-src 'self' https://*.supabase.co; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/widget.min.js',
        headers: [
          {
            key: 'Cache-Control',
            // Edge CDN caching: cache for 1 day (86400s), serve stale while revalidating
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          }
        ],
      },
      {
        source: '/widget.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          }
        ],
      }
    ];
  },
};

export default nextConfig;
