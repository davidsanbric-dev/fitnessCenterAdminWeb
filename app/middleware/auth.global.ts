import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()

  if (import.meta.client) {
    auth.hydrateFromStorage()
    if (auth.token.value && auth.isTokenExpired(auth.token.value)) {
      auth.clearAuth()
    }
  }

  if (to.path === '/login' && auth.isAuthenticated.value) {
    return navigateTo('/admin/home')
  }

  // Modules a trainer is scoped to. Anything else under /admin is staff-only.
  const trainerAllowedPaths = ['/admin/home', '/admin/bookings', '/admin/slots', '/admin/trainer-profile']

  if (to.path.startsWith('/admin')) {
    if (!auth.isAuthenticated.value) {
      return navigateTo('/login')
    }

    if (!auth.canAccessWeb.value) {
      return navigateTo('/login')
    }

    // A trainer can reach only its own modules; bounce other /admin routes home.
    if (auth.isTrainer.value && !auth.isAdmin.value && !trainerAllowedPaths.includes(to.path)) {
      return navigateTo('/admin/home')
    }
  }
})
