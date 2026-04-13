// @ts-nocheck
import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    middlewareClientMaxBodySize: 50 * 1024 * 1024,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        hostname: "cdn.sanity.io",
        protocol: "https",
        port: "",
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mx.pinterest.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      const stubDir = path.join(process.cwd(), 'src/lib');
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/lib/bible-rvr-node': path.join(stubDir, 'bible-rvr-node.stub.ts'),
        '@/lib/bible-public-json-node': path.join(stubDir, 'bible-public-json-node.stub.ts'),
      };
    }
    return config;
  },
};

// Force rebuild to clear cache
export default nextConfig;
