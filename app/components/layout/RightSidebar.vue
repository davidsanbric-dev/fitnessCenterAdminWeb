<template>
  <div v-if="isOpen" class="sidebar-backdrop" @click="closeSidebar" />
  <aside class="app-sidebar-right" :class="{ 'is-open': isOpen }">
    <div class="panel" style="padding: 0.8rem">
      <AppLogo :size="60" />
    </div>

    <nav class="nav-list">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: route.path === item.to }"
        @click="closeSidebar"
      >
        <component :is="item.icon" class="nav-icon" />
        {{ t(item.label) }}
      </NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <label class="sidebar-setting-row">
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
      <label class="sidebar-setting-row">
        <small class="muted">{{ t('theme_label') }}</small>
        <button class="btn" type="button" @click="toggleTheme">{{ themeLabel }}</button>
      </label>
      <div class="sidebar-user">
        <span class="muted sidebar-email">{{ auth.user.value?.email || t('guest_user') }}</span>
        <button class="btn" @click="auth.logout">{{ t('logout') }}</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { resolveUiMessage } from '~/config/uiMessages'
import { Home, Calendar, User, Dumbbell, CreditCard, Bell } from 'lucide-vue-next'
import AppLogo from '../icons/AppLogo.vue'
import { useSidebar } from '~/composables/useSidebar'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const { locale, setLocale } = useLocale()
const { theme, toggleTheme } = useTheme()
const { isOpen, closeSidebar } = useSidebar()
const auth = useAuth()

const t = (key: string) => resolveUiMessage(key, locale.value)
const themeLabel = computed(() => (theme.value === 'dark' ? t('theme_switch_light') : t('theme_switch_dark')))

const navItems = [
  { label: 'nav_home', to: '/admin/home', icon: Home },
  { label: 'nav_bookings', to: '/admin/bookings', icon: Calendar },
  { label: 'nav_trainers', to: '/admin/trainers', icon: User },
  { label: 'nav_disciplines', to: '/admin/disciplines', icon: Dumbbell },
  { label: 'nav_memberships', to: '/admin/memberships', icon: CreditCard },
  { label: 'nav_notifications', to: '/admin/notifications', icon: Bell },
]
</script>

<style scoped>
.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
  display: inline-block;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin: 0.25rem 0;
  border-radius: 0.375rem;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-link.active {
  background-color: rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: grid;
  gap: 0.6rem;
}

.sidebar-setting-row {
  display: grid;
  gap: 0.2rem;
}

.sidebar-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.4rem;
}

.sidebar-email {
  font-size: 0.78rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
</style>
