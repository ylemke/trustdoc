/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
    NEXT_PUBLIC_VERIFY_URL: process.env.NEXT_PUBLIC_VERIFY_URL || 'http://localhost/api/v1/verify',
  },
};

module.exports = nextConfig;
