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
};

module.exports = nextConfig;
