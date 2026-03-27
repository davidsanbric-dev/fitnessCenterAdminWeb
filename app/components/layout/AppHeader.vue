<template>
  <header class="topbar">
    <div>
      <h1 class="section-title">{{ t('header_title') }}</h1>
      <p class="section-subtitle">{{ t('header_subtitle') }}</p>
    </div>
    <div style="display: flex; gap: 0.55rem; align-items: center">
      <label style="display: grid; gap: 0.2rem">
        <small class="muted">{{ t('language_label') }}</small>
        <select
          class="input locale-select"
          :value="locale"
          @change="setLocale(($event.target as HTMLSelectElement).value)"
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
      </label>
      <label style="display: grid; gap: 0.2rem">
        <small class="muted">{{ t('theme_label') }}</small>
        <button class="btn" type="button" @click="toggleTheme">
          {{ themeLabel }}
        </button>
      </label>
      <span class="muted">{{ auth.user.value?.email || t('guest_user') }}</span>
      <button class="btn" @click="auth.logout">{{ t('logout') }}</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { resolveUiMessage } from '~/app/config/uiMessages'
import { useAuth } from '~/composables/useAuth'
import { useLocale } from '~/composables/useLocale'

const auth = useAuth()
const {
  locale,
  setLocale,
} = useLocale()
const { theme, toggleTheme } = useTheme()

const t = (key: string) => resolveUiMessage(key, locale.value)
const themeLabel = computed(() => {
  return theme.value === 'dark' ? t('theme_switch_light') : t('theme_switch_dark')
})
</script>
