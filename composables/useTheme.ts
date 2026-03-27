import { ref } from 'vue'

export type AppTheme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'fitness-admin-theme'
const theme = ref<AppTheme>('dark')
const isInitialized = ref(false)

const normalizeTheme = (theme: string | null): AppTheme => {
  return theme === 'light' ? 'light' : 'dark'
}

export const useTheme = () => {
  const applyTheme = (nextTheme: AppTheme) => {
    theme.value = nextTheme

    if (typeof window === 'undefined') {
      return
    }

    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  const initializeTheme = () => {
    if (isInitialized.value) {
      return
    }

    isInitialized.value = true

    if (typeof window === 'undefined') {
      return
    }

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    if (storedTheme) {
      applyTheme(normalizeTheme(storedTheme))
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark ? 'dark' : 'light')
  }

  const toggleTheme = () => {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  initializeTheme()

  return {
    theme,
    applyTheme,
    toggleTheme,
  }
}
