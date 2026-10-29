/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ship the SQL migrations with the server bundle so runtime auto-migration
  // can still run on serverless hosts (they are read with fs at runtime).
  outputFileTracingIncludes: {
    '/*': ['./supabase/**/*.sql'],
  },
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Clickjacking: no site (incl. ours) may frame this app.
          { key: 'X-Frame-Options', value: 'DENY' },
          // MIME sniffing: browsers must trust the declared Content-Type.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak full admin URLs to third parties via Referer.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable high-value browser features the app never uses.
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          // Extra hardening header (modern browsers, mirrors XFO for compat).
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
