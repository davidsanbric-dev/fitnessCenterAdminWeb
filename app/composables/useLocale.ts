export type AppLocale = 'en' | 'es'

const LOCALE_STORAGE_KEY = 'fitness-admin-locale'

const normalizeLocale = (locale: string): AppLocale => {
  return locale.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export const useLocale = () => {
  const locale = useState<AppLocale>('app-locale', () => 'en')
  const isInitialized = useState<boolean>('app-locale-initialized', () => false)

  const initializeLocale = () => {
    if (isInitialized.value) {
      return
    }

    isInitialized.value = true

    if (!import.meta.client) {
      return
    }

    const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (storedLocale) {
      locale.value = normalizeLocale(storedLocale)
      return
    }

    locale.value = normalizeLocale(navigator.language || 'en')
  }

  const setLocale = (nextLocale: string) => {
    const normalized = normalizeLocale(nextLocale)
    locale.value = normalized

    if (import.meta.client) {
      localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
    }
  }

  initializeLocale()

  return {
    locale,
    setLocale,
    supportedLocales: ['en', 'es'] as AppLocale[],
  }
}