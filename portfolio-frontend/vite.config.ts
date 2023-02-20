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
    viteCompression({
      filter: /\.(js|mjs|json|css|html|svg|webp|ttf|png|ico|txt)$/i,
    }),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      workbox: {
        importScripts: ["/push-sw.js"],
        navigateFallbackDenylist: [/\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              return url.pathname.startsWith("/api");
            },
            handler: "NetworkFirst" as const,
            method: "GET",
            options: {
              cacheName: "api-cache",
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.ico",
        "favicon-32x32.ico",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "Lorenzo Spinelli's portfolio website",
        short_name: "lorenzosp",
        description: "The web application for Lorenzo Spinelli's portfolio",
        theme_color: "#000",
        icons: [],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
