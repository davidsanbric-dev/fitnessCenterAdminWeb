<template>
  <aside class="app-sidebar-right">
    <div class="panel" style="padding: 0.8rem">
      <!-- <strong>{{ t('sidebar_title') }}</strong>
      <p class="muted" style="margin: 0.35rem 0 0">{{ t('sidebar_subtitle') }}</p> -->
      <AppLogo :size="60" />
    </div>

    <nav class="nav-list">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: route.path === item.to }"
      >
        <component :is="item.icon" class="nav-icon" />
        {{ t(item.label) }}
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { resolveUiMessage } from '~/app/config/uiMessages'
import { Home, Calendar, User, Dumbbell, CreditCard, Bell } from 'lucide-vue-next'
import AppLogo from '../icons/AppLogo.vue'

const route = useRoute()
const { locale } = useLocale()

const t = (key: string) => resolveUiMessage(key, locale.value)

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
</style>
