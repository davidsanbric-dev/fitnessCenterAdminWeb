import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const auth = useAuth()
  auth.hydrateFromStorage()
  // Keep the app token in sync with the Firebase SDK across reloads, and react
  // to client-side sign-out events.
  auth.initAuthListener()
})
