export default defineNuxtConfig({
  compatibilityDate: '2026-07-24',

  devtools: { enabled: false },
  ssr: true,

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
        { property: 'og:image', content: '' },
        { property: 'og:title', content: '' },
        { property: 'og:description', content: '' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicons/favicon.ico' },
        { rel: 'apple-touch-icon-precomposed', href: '/favicons/apple-touch-icon-57x57.png' },
        { rel: 'apple-touch-icon-precomposed', href: '/favicons/apple-touch-icon-114x114.png' },
        { rel: 'apple-touch-icon-precomposed', href: '/favicons/apple-touch-icon-72x72.png' },
        { rel: 'apple-touch-icon-precomposed', href: '/favicons/apple-touch-icon-144x144.png' },
        { rel: 'apple-touch-icon-precomposed', href: '/favicons/apple-touch-icon-60x60.png' },
        { rel: 'apple-touch-icon-precomposed', href: '/favicons/apple-touch-icon-120x120.png' },
        { rel: 'apple-touch-icon-precomposed', href: '/favicons/apple-touch-icon-76x76.png' },
        { rel: 'apple-touch-icon-precomposed', href: '/favicons/apple-touch-icon-152x152.png' },
        { rel: 'icon', type: 'image/png', href: '/favicons/favicon-196x196.png' },
        { rel: 'icon', type: 'image/png', href: '/favicons/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', href: '/favicons/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', href: '/favicons/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', href: '/favicons/favicon-128.png' }
      ]
    }
  },

  typescript: {
    shim: false
  },

  css: [
    '~/styles/main.scss'
  ],

  modules: [
    'vuetify-nuxt-module',
    '@nuxt/fonts',
    '@vite-pwa/nuxt'
  ],

  vuetify: {
    moduleOptions: {
      styles: { configFile: 'styles/settings.scss' }
    },
    vuetifyOptions: {
      defaults: {},
      icons: {
        defaultSet: 'mdi'
      },
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            dark: false,
            colors: {

            }
          }
        }
      }
    }
  },

  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    manifest: {
      name: 'Piximize',
      short_name: 'Piximize',
      description: 'An easy way to optimize your images',
      theme_color: '#187bc0',
      start_url: '/',
      display: 'standalone',
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
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
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
      periodicSyncForUpdates: process.env.NODE_ENV !== 'production' ? 20 : 3600
    },
    devOptions: {
      enabled: process.env.NODE_ENV === 'production',
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
