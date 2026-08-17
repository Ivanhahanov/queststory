import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
    // custom push/notificationclick handlers live in public/push-sw.js and get
    // stitched into the generated service worker via importScripts.
    importScripts: ["/push-sw.js"],
  },
});

export default withPWA(nextConfig);
