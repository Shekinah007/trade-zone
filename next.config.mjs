/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable server-side rendering for /dashboard to display it as an empty viewport.
  // output: 'export',

  images: {
    unoptimized: true,
  },
};

export default nextConfig;