/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@grapplemap/db', '@grapplemap/config'],
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
};

export default nextConfig;
