const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@domains/clinops',
    '@domains/studydesign',
    '@domains/site-operation',
    '@domains/organization',
    '@domains/identity-access',
    '@packages/ui-kit',
    '@packages/services',
    '@packages/utils',
    '@packages/shared',
    '@packages/hooks',
    '@packages/api',
  ],
  webpack: (config, { isServer }) => {
    // Handle TypeScript files in packages
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    
    // Add alias support for monorepo packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@domains': path.resolve(__dirname, '../../packages/domains'),
      '@packages': path.resolve(__dirname, '../../packages'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
    };

    return config;
  },
};

module.exports = nextConfig;
