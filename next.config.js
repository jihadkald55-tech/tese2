/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // RTL support is handled via Tailwind and HTML dir="rtl"
  experimental: {
    // Disable static page generation for dynamic routes
    isrMemoryCacheSize: 0,
  },
  // Disable static optimization to prevent build errors with context providers
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
