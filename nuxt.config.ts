// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/main.css'],
  app: {
    head: {
      title: 'Fitness Admin',
      // Browser-tab branding: the fitness app logo replaces the default favicon.
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },
  routeRules: {
    '/': { redirect: '/login' },
  },
  dir: {
    pages: 'pages',
    layouts: 'layouts',
    middleware: 'middleware',
    plugins: 'plugins',
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    },
  },
})
