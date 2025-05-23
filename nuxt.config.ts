export default defineNuxtConfig({
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
        { hid: 'og:image', property: 'og:image', content: '' },
        { hid: 'og:title', property: 'og:title', content: '' },
        { hid: 'og:description', property: 'og:description', content: '' }
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

  experimental: {
    reactivityTransform: true
  },

  typescript: {
    shim: false
  },

  css: [
    '~/styles/main.scss'
  ],

  modules: [
    '@pinia/nuxt',
    'nuxt-gtag',
    '@nuxt/content',
    'vuetify-nuxt-module',
    '@nuxt/fonts',
    '@vite-pwa/nuxt'
  ],

  vuetify: {
    moduleOptions: {
      styles: { configFile: '/styles/settings.scss' }
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
          // You can also define a dark theme
          // dark: {
          //   dark: true,
          //   colors: {
          //     primary: '#2196F3'
          //     // ... other colors
          //   }
          // }
        }
      }
    }
  },

  // gtag: {
  //   id: 'G-'
  // },

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
        // {
        //   src: 'maskable-icon-512x512.png',
        //   sizes: '512x512',
        //   type: 'image/png',
        //   purpose: 'maskable'
        // }
      ]
    },
    workbox: {
      navigateFallback: '/',
      runtimeCaching: [{
        urlPattern: /^https:\/\//,
        handler: 'NetworkFirst', // Always try network first
        options: {
          networkTimeoutSeconds: 10, // Only wait 10 seconds before falling back to cache
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50, // Keep fewer entries
            maxAgeSeconds: 60 * 60 * 2 // Cache for only 2 hours
          }
        }
      }],
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true
    },
    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
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
  },

  imports: {
    dirs: ['composables/**', 'stores/**']
  },

  compatibilityDate: '2024-11-12'
})
