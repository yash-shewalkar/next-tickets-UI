import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    // Polyfill for 'process' in the browser
    if (!isServer) {
      config.resolve.fallback = {
        process: require.resolve('process/browser'),
        path: require.resolve('path-browserify'),
        fs: false, // Optional: if 'fs' is not used in the client-side code
      };
    }
    return config;
  },
};

export default nextConfig;
