import { useRuntimeConfig } from 'nuxt/app'

/**
 * Resolve a media path returned by the API (e.g. "/profile-images/media/3.webp")
 * to a fetchable absolute URL by prepending the API base. Already-absolute URLs
 * and empty values are passed through untouched.
 */
export const useMediaUrl = () => {
  const apiBaseUrl = String(useRuntimeConfig().public.apiBaseUrl || '')

  return (path: string | null | undefined): string => {
    const value = typeof path === 'string' ? path.trim() : ''
    if (!value) return ''
    if (value.startsWith('http://') || value.startsWith('https://')) return value
    return `${apiBaseUrl}${value}`
  }
}
