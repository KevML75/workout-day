import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths so the build works from any subpath (e.g. GitHub Pages /<repo>/).
  base: './',
  plugins: [
    react(),
    VitePWA({
      // Fetch updates in the background and apply them on the next launch.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Workout Day',
        short_name: 'Workout',
        description: "Today's dumbbell workout, or a rest day.",
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#f5f5f7',
        theme_color: '#0a7d55',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
})
