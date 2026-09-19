import type { NextConfig } from "next";
import withPWAInit, { runtimeCaching as defaultRuntimeCaching } from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {};

// WebKit/Safari не умеет корректно отдавать редирект, если он прошёл через
// service worker для navigation-запроса — вместо обычного редиректа браузер
// показывает нативную ошибку "This page couldn't be loaded". Наши страницы
// (join-флоу игрока, корень "/") часто редиректят, так что перехват навигации
// через SW отключаем полностью — остальной кеш (статика, шрифты, /api/) не трогаем.
const NAV_CACHE_NAMES = new Set(["pages", "pages-rsc", "pages-rsc-prefetch"]);
const runtimeCaching = defaultRuntimeCaching.filter(
  (entry) => !NAV_CACHE_NAMES.has(entry.options?.cacheName ?? ""),
);

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching,
    // custom push/notificationclick handlers live in public/push-sw.js and get
    // stitched into the generated service worker via importScripts.
    importScripts: ["/push-sw.js"],
  },
});

export default withPWA(nextConfig);
