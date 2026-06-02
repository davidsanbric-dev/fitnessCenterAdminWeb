import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
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

  const getFirebaseAuthClient = (): Auth => {
    const config = useRuntimeConfig()

    if (getApps().length === 0) {
      const firebaseApiKey = String(config.public.firebaseApiKey || '').trim()
      const firebaseAuthDomain = String(config.public.firebaseAuthDomain || '').trim()
      const firebaseProjectId = String(config.public.firebaseProjectId || '').trim()
      const firebaseAppId = String(config.public.firebaseAppId || '').trim()
      const firebaseMessagingSenderId = String(config.public.firebaseMessagingSenderId || '').trim()

      if (!firebaseApiKey || !firebaseAuthDomain || !firebaseProjectId || !firebaseAppId) {
        throw new Error(
          'Firebase web config is missing. Set NUXT_PUBLIC_FIREBASE_API_KEY, NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NUXT_PUBLIC_FIREBASE_PROJECT_ID, and NUXT_PUBLIC_FIREBASE_APP_ID in project_web_app/.env and restart the dev server.',
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

  /**
   * Returns the current Firebase ID token. The Firebase SDK auto-refreshes near
   * expiry; pass `forceRefresh` to mint a new token immediately (e.g. after a
   * `401 Token expired`, or after `firebase-login` writes custom claims). Falls
   * back to the persisted token when the SDK user has not rehydrated yet.
   */
  const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    if (typeof window === 'undefined') {
      return token.value
    }

    try {
      const currentUser = getFirebaseAuthClient().currentUser
      if (currentUser) {
        const freshToken = await currentUser.getIdToken(forceRefresh)
        token.value = freshToken
        persist()
        return freshToken
      }
    } catch {
      // Fall back to the persisted token below.
    }

    return token.value
  }

  const loginWithFirebase = async (email: string, password: string) => {
    loading.value = true

    try {
      const firebaseAuth = getFirebaseAuthClient()
      const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password)

      // 1) ID token as-is for the exchange (no force-refresh needed yet).
      const idToken = await credentials.user.getIdToken()

      const api = useApiClient()
      const response = await api.post<FirebaseLoginResponse>(
        '/auth/firebase-login',
        { id_token: idToken },
        false,
      )

      user.value = response.user

      // 2) firebase-login wrote custom claims (app_role, etc.); force-refresh so
      //    subsequent protected calls carry an up-to-date token. See spec §5.4.
      token.value = await credentials.user.getIdToken(true)
      persist()

      return response
    } finally {
      loading.value = false
    }
  }

  /** Sign out of Firebase and drop the app session, then route to login. */
  const logout = async () => {
    if (typeof window !== 'undefined') {
      try {
        await signOut(getFirebaseAuthClient())
      } catch {
        // Ignore sign-out errors; we clear local state regardless.
      }
    }

    clearAuth()
    await navigateTo('/login')
  }

  /**
   * Handle an invalidated session (revoked/invalid token): drop local state and
   * route to login. Used by the API client when the backend rejects the token.
   */
  const handleSessionExpired = async () => {
    if (typeof window !== 'undefined') {
      try {
        await signOut(getFirebaseAuthClient())
      } catch {
        // Ignore; clearing local state is what matters.
      }
    }

    clearAuth()
    await navigateTo('/login')
  }

  /**
   * Keep the app token in sync with the Firebase SDK after a page reload, and
   * clear the app session when Firebase reports the user signed out.
   */
  const initAuthListener = () => {
    if (typeof window === 'undefined') {
      return
    }

    onAuthStateChanged(getFirebaseAuthClient(), async (currentUser) => {
      if (currentUser && user.value) {
        token.value = await currentUser.getIdToken()
        persist()
      } else if (!currentUser) {
        clearAuth()
      }
    })
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
    getIdToken,
    loginWithFirebase,
    handleSessionExpired,
    initAuthListener,
    logout,
  }
}
