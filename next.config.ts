import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*\.(?:png|jpg|jpeg|svg|webp|gif)/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    {
      urlPattern: /^https?.*\/streams/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "stream-list-cache",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
