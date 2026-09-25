import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      isProduction: process.env.DEV === "false",
    }),
    // Pre-compress text assets only; images are already compressed.
    viteCompression({
      filter: /\.(js|mjs|json|css|html|svg|txt|xml|ttf|woff2?)$/i,
    }),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      // Registration/reload policy lives in serviceWorkerUpdates.ts.
      injectRegister: false,
      workbox: {
        importScripts: ["/push-sw.js"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        // API/admin responses must never silently fall back to stale data.
        // Keep precaching versioned application assets for offline navigation.
        runtimeCaching: [],
      },
      devOptions: {
        enabled: false,
      },
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "Lorenzo Spinelli",
        short_name: "Lorenzo",
        description: "Résumé, projects and writing from Lorenzo Spinelli.",
        start_url: "/",
        display: "standalone",
        background_color: "#FFF8EF",
        theme_color: "#FFF8EF",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
