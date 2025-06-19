import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: 'standalone',
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'example.com',
  //       port: '',
  //       pathname: '/images/**',
  //     },
  //     {
  //       protocol: 'https',
  //       hostname: 'another-example.com',
  //       port: '',
  //       pathname: '/assets/**',
  //     },
  //   ],
  // },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lodash'],
  },
};

export default nextConfig;
