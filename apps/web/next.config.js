/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const config = {
  // Use static export for Capacitor builds, server mode for Vercel
  output: process.env.BUILD_TARGET === 'capacitor' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: process.env.BUILD_TARGET === 'capacitor',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;