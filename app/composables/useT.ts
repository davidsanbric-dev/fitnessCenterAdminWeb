import { resolveUiMessage } from '~/config/uiMessages'
import { useLocale } from './useLocale'

/**
 * Returns a `t(key)` translator bound to the active locale. The returned
 * function reads `locale.value` on each call, so it stays reactive inside
 * templates and computeds when the user switches language.
 */
export const useT = () => {
  const { locale } = useLocale()
  return (key: string) => resolveUiMessage(key, locale.value)
}
