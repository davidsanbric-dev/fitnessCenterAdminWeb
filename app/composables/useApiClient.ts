import {
  useRuntimeConfig,
} from 'nuxt/app'

import { useAuth } from './useAuth'
import { extractDetail, extractStatus } from '~/utils/httpError'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  requiresAuth?: boolean
}

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const auth = useAuth()

  const buildHeaders = async (requiresAuth: boolean): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // Identifies the originating app so the backend can enforce that only
      // staff (admin/manager) accounts sign in from the web app. See the API's
      // ClientOrigin gate in /auth/firebase-login.
      'X-Client-Platform': 'web',
    }

    if (requiresAuth) {
      // Always attach the CURRENT Firebase ID token (the SDK auto-refreshes near
      // expiry); fall back to the persisted token before the SDK rehydrates.
      const idToken = await auth.getIdToken()
      if (idToken) {
        headers.Authorization = `Bearer ${idToken}`
      }
    }

    return headers
  }

  const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const {
      method = 'GET',
      query,
      body,
      requiresAuth = true,
    } = options

    const exec = async (headers: Record<string, string>): Promise<T> =>
      await $fetch<T>(`${config.public.apiBaseUrl}${path}`, {
        method,
        query,
        body: body as Record<string, unknown> | undefined,
        headers,
      }) as T

    try {
      return await exec(await buildHeaders(requiresAuth))
    } catch (error) {
      if (!requiresAuth) {
        throw error
      }

      const status = extractStatus(error)
      const detail = extractDetail(error)

      // Token expired → force-refresh once and retry the request (spec §5.3).
      if (status === 401 && detail === 'Token expired') {
        await auth.getIdToken(true)
        return await exec(await buildHeaders(true))
      }

      // Revoked / invalid / missing session → sign out and route to login.
      if (
        status === 401
        && ['Token revoked', 'Invalid Firebase token', 'Token missing email', 'User not found', 'Not authenticated']
          .includes(detail || '')
      ) {
        await auth.handleSessionExpired()
      }

      throw error
    }
  }

  return {
    request,
    get: <T>(path: string, query?: RequestOptions['query'], requiresAuth = true) =>
      request<T>(path, { method: 'GET', query, requiresAuth }),
    post: <T>(path: string, body?: unknown, requiresAuth = true) =>
      request<T>(path, { method: 'POST', body, requiresAuth }),
  }
}
