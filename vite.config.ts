import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: {
      name: '180 Personal OS', short_name: '180 OS', description: 'Система управления жизнью на 180 дней',
      theme_color: '#08090b', background_color: '#08090b', display: 'standalone', orientation: 'portrait-primary',
      start_url: '/', scope: '/',
      icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
    },
    workbox: {
      importScripts: ['/push-sw.js'],
      navigateFallback: '/index.html',
      runtimeCaching: [{ urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\//, handler: 'NetworkFirst', options: { cacheName: 'supabase-data', networkTimeoutSeconds: 5, expiration: { maxEntries: 50, maxAgeSeconds: 86400 } } }]
    }
  })]
})
