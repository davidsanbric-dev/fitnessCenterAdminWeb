// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/main.css'],
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
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
      firebaseApiKey:
        process.env.NUXT_PUBLIC_FIREBASE_API_KEY
        || process.env.FIREBASE_API_KEY
        || process.env.VITE_FIREBASE_API_KEY
        || '',
      firebaseAuthDomain:
        process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        || process.env.FIREBASE_AUTH_DOMAIN
        || process.env.VITE_FIREBASE_AUTH_DOMAIN
        || '',
      firebaseProjectId:
        process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID
        || process.env.FIREBASE_PROJECT_ID
        || process.env.VITE_FIREBASE_PROJECT_ID
        || '',
      firebaseAppId:
        process.env.NUXT_PUBLIC_FIREBASE_APP_ID
        || process.env.FIREBASE_APP_ID
        || process.env.VITE_FIREBASE_APP_ID
        || '',
      firebaseMessagingSenderId:
        process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
        || process.env.FIREBASE_MESSAGING_SENDER_ID
        || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
        || '',
    },
  },
})
