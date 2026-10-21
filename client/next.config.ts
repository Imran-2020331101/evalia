import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hosted on Vercel there is no backend, so default to the self-contained demo mode.
  env: {
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE ?? (process.env.VERCEL ? 'true' : 'false'),
  },
  /* config options here */
  images: {
    domains: ['i.pinimg.com','res.cloudinary.com', 'media.gifdb.com','i.ytimg.com'],
  },
};

export default nextConfig;
