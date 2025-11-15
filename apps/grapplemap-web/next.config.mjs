/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@grapplemap/ui', '@grapplemap/network', '@grapplemap/db', '@grapplemap/utils'],
};

export default nextConfig;
