import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()

  if (import.meta.client) {
    auth.hydrateFromStorage()
  }

  if (to.path === '/login' && auth.isAuthenticated.value) {
    return navigateTo('/admin/home')
  }

  if (to.path.startsWith('/admin')) {
    if (!auth.isAuthenticated.value) {
      return navigateTo('/login')
    }

    if (!auth.isAdmin.value) {
      return navigateTo('/login')
    }
  }
})
