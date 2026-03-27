import {
  useRuntimeConfig,
} from 'nuxt/app'

import { useAuth } from './useAuth'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  requiresAuth?: boolean
}

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const auth = useAuth()

  const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const {
      method = 'GET',
      query,
      body,
      requiresAuth = true,
    } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (requiresAuth && auth.token.value) {
      headers.Authorization = `Bearer ${auth.token.value}`
    }

    return await $fetch<T>(`${config.public.apiBaseUrl}${path}`, {
      method,
      query,
      body,
      headers,
    })
  }

  return {
    request,
    get: <T>(path: string, query?: RequestOptions['query'], requiresAuth = true) =>
      request<T>(path, { method: 'GET', query, requiresAuth }),
    post: <T>(path: string, body?: unknown, requiresAuth = true) =>
      request<T>(path, { method: 'POST', body, requiresAuth }),
  }
}
