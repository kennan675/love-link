import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  envPrefix: ["VITE_", "SUPABASE_"],
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      includeAssets: ['favicon.ico', 'blacklovelink-logo.png'],
      manifest: {
        name: 'BlackLoveLink',
        short_name: 'BlackLoveLink',
        description: 'Where Intentional Black Love Begins — meet verified Black professionals',
        theme_color: '#141720',
        background_color: '#141720',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/swipe',
        scope: '/',
        lang: 'en',
        id: 'com.blacklovelink.app',
        categories: ['lifestyle', 'social'],
        icons: [
          {
            src: 'blacklovelink-logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'blacklovelink-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'blacklovelink-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Discover',
            short_name: 'Discover',
            description: 'Browse your matches',
            url: '/swipe',
            icons: [{ src: 'blacklovelink-logo.png', sizes: '192x192' }]
          },
          {
            name: 'Messages',
            short_name: 'Messages',
            description: 'Open your messages',
            url: '/messages',
            icons: [{ src: 'blacklovelink-logo.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        // Force new SW to take over immediately — fixes Chrome serving stale cached builds
        skipWaiting: true,
        clientsClaim: true,
        // Cache strategies for offline support
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
