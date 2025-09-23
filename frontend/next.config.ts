import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '1mb' } },
  reactStrictMode: true,
};

export default nextConfig;
