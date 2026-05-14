/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  distDir: isDev ? '.next-dev' : '.next',
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
