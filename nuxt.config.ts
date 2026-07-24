export default defineNuxtConfig({
  compatibilityDate: '2026-07-24',

  devtools: { enabled: false },
  ssr: true,

  modules: [
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: false,
    experimental: {
      componentDetection: true
    }
  },

  // Load icons from Iconify CDN at runtime instead of bundling collections.
  icon: {
    provider: 'iconify',
    serverBundle: false,
    clientBundle: {
      scan: false
    }
  },

  runtimeConfig: {
    public: {
      baseUrl: 'http://localhost:3000',
      apiUrl: 'http://localhost:3030'
    }
  },

  app: {
    head: {
      title: 'Piximize',
      meta: [
        { name: 'theme-color', content: '#187bc0' },
        { name: 'description', content: 'An easy way to optimize your images' },
        { property: 'og:image', content: '' },
        { property: 'og:title', content: 'Piximize' },
        { property: 'og:description', content: 'An easy way to optimize your images' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/pwa/ios/180.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/pwa/ios/32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/pwa/ios/16.png' }
      ]
    }
  },

  typescript: {
    shim: false
  },

  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    registerWebManifestInRouteRules: true,
    manifest: {
      name: 'Piximize',
      short_name: 'Piximize',
      description: 'An easy way to optimize your images',
      theme_color: '#187bc0',
      background_color: '#ffffff',
      lang: 'en',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/pwa/64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: '/pwa/192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa/512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/pwa/512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,ico,txt,woff2}'],
      globIgnores: ['**/pwa/android/**', '**/pwa/ios/**', '**/pwa/windows11/**'],
      runtimeCaching: [{
        urlPattern: /^https:\/\//,
        handler: 'NetworkFirst',
        options: {
          networkTimeoutSeconds: 10,
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 2
          }
        }
      }],
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      type: 'module'
    }
  },

  components: {
    global: true,
    dirs: [
      {
        path: '~/components',
        pathPrefix: false
      }
    ]
  }
})
