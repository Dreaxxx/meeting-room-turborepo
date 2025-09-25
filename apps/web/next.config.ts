import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '1mb' } },
  reactStrictMode: true,
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    return [{ source: '/api/:path*', destination: `${target}/:path*` }];
  },
};

export default nextConfig;
