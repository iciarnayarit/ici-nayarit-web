// @ts-nocheck
import path from 'node:path';
import type { NextConfig } from 'next';
import CompressionPlugin from 'compression-webpack-plugin';

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', '@radix-ui/react-icons'],
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
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      // Tree Shaking hints: keep only reachable exports in final bundles.
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
        innerGraph: true,
        concatenateModules: true,
      };
    }

    if (isProd && !isServer) {
      // Pre-compress static assets to reduce transfer size.
      config.plugins.push(
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg|json)$/i,
          threshold: 10 * 1024,
          minRatio: 0.8,
        }),
        new CompressionPlugin({
          filename: '[path][base].br',
          algorithm: 'brotliCompress',
          compressionOptions: { level: 11 },
          test: /\.(js|css|html|svg|json)$/i,
          threshold: 10 * 1024,
          minRatio: 0.8,
        })
      );
    }

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
