import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { computed } from 'vue'
import {
  navigateTo,
  useRuntimeConfig,
  useState,
} from 'nuxt/app'

import { useApiClient } from './useApiClient'

interface AuthUser {
  id: number
  email: string
  role: string
  permissions: string[]
  profile: {
    first_name: string
    last_name: string
    location_codes: string[]
  }
}

interface FirebaseLoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

const AUTH_TOKEN_KEY = 'fitness_admin_token'
const AUTH_USER_KEY = 'fitness_admin_user'

export const useAuth = () => {
  const token = useState<string | null>('auth-token', () => null)
  const user = useState<AuthUser | null>('auth-user', () => null)
  const ready = useState<boolean>('auth-ready', () => false)
  const loading = useState<boolean>('auth-loading', () => false)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const isAdmin = computed(() => ['admin', 'manager'].includes(user.value?.role || ''))

  const hydrateFromStorage = () => {
    if (typeof window === 'undefined' || ready.value) {
      return
    }

    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      const storedUser = localStorage.getItem(AUTH_USER_KEY)

      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = JSON.parse(storedUser) as AuthUser
      }
    } catch {
      token.value = null
      user.value = null
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    }

    ready.value = true
  }

  const decodeJwtPayload = (rawToken: string) => {
    try {
      const [, payload] = rawToken.split('.')
      if (!payload || typeof window === 'undefined') {
        return null
      }

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
      const decoded = window.atob(padded)
      return JSON.parse(decoded) as { exp?: number }
    } catch {
      return null
    }
  }

  const isTokenExpired = (rawToken: string) => {
    const payload = decodeJwtPayload(rawToken)
    if (!payload?.exp) {
      return false
    }

    return Date.now() / 1000 >= payload.exp
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    persist()
  }

  const persist = () => {
    if (typeof window === 'undefined') {
      return
    }

    if (token.value && user.value) {
      localStorage.setItem(AUTH_TOKEN_KEY, token.value)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user.value))
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    }
  }

  const getFirebaseAuthClient = () => {
    const config = useRuntimeConfig()

    if (getApps().length === 0) {
      const firebaseApiKey = String(config.public.firebaseApiKey || '').trim()
      const firebaseAuthDomain = String(config.public.firebaseAuthDomain || '').trim()
      const firebaseProjectId = String(config.public.firebaseProjectId || '').trim()
      const firebaseAppId = String(config.public.firebaseAppId || '').trim()
      const firebaseMessagingSenderId = String(config.public.firebaseMessagingSenderId || '').trim()

      if (!firebaseApiKey || !firebaseAuthDomain || !firebaseProjectId || !firebaseAppId) {
        throw new Error(
          'Firebase web config is missing. Set NUXT_PUBLIC_FIREBASE_API_KEY, NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NUXT_PUBLIC_FIREBASE_PROJECT_ID, and NUXT_PUBLIC_FIREBASE_APP_ID in project_web_app/project_web_app/.env and restart the dev server.',
        )
      }

      initializeApp({
        apiKey: firebaseApiKey,
        authDomain: firebaseAuthDomain,
        projectId: firebaseProjectId,
        appId: firebaseAppId,
        messagingSenderId: firebaseMessagingSenderId,
      })
    }

    return getAuth(getApp())
  }

  const loginWithFirebase = async (email: string, password: string) => {
    loading.value = true

    try {
      const firebaseAuth = getFirebaseAuthClient()
      const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password)
      const idToken = await credentials.user.getIdToken(true)

      const api = useApiClient()
      const response = await api.post<FirebaseLoginResponse>(
        '/auth/firebase-login',
        { id_token: idToken },
        false,
      )

      token.value = idToken
      user.value = response.user
      persist()

      return response
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    if (typeof window !== 'undefined') {
      const firebaseAuth = getFirebaseAuthClient()
      await signOut(firebaseAuth)
    }

    clearAuth()
    await navigateTo('/login')
  }

  return {
    token,
    user,
    ready,
    loading,
    isAuthenticated,
    isAdmin,
    hydrateFromStorage,
    isTokenExpired,
    clearAuth,
    loginWithFirebase,
    logout,
  }
}
