import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_PUBLIC_* di-inline saat compile. Kalau .env tidak terbaca, fetch jadi
  // "undefined/api/..." -> beri default supaya dev tetap jalan.
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/env
  // Di Vercel, VERCEL_PROJECT_PRODUCTION_URL (domain production, tanpa https://)
  // tersedia otomatis saat build: https://vercel.com/docs/environment-variables/system-environment-variables
  env: {
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : `http://localhost:${process.env.PORT || 3000}`),
  },
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Wildcard: store Vercel Blob milikmu punya subdomain berbeda dari store tim.
        // https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "cdn.fashn.ai",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
