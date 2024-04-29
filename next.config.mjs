/** @type {import('next').NextConfig} */

const currentYear = new Date().getFullYear();

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.formula1.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: `/teams/${currentYear}`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
