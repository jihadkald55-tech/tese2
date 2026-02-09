/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force dynamic rendering - disable static generation completely
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Disable static page generation in production build
  output: undefined, // Use default server output, not export
}

module.exports = nextConfig
