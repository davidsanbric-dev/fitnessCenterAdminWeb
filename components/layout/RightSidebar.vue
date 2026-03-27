<template>
  <aside class="app-sidebar-right">
    <div class="panel" style="padding: 0.8rem">
      <strong>{{ t('sidebar_title') }}</strong>
      <p class="muted" style="margin: 0.35rem 0 0">{{ t('sidebar_subtitle') }}</p>
    </div>

    <nav class="nav-list">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: route.path === item.to }"
      >
        {{ t(item.label) }}
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { resolveUiMessage } from '~/app/config/uiMessages'

const route = useRoute()
const { locale } = useLocale()

const t = (key: string) => resolveUiMessage(key, locale.value)

const navItems = [
  { label: 'nav_home', to: '/admin/home' },
  { label: 'nav_bookings', to: '/admin/bookings' },
  { label: 'nav_trainers', to: '/admin/trainers' },
  { label: 'nav_disciplines', to: '/admin/disciplines' },
  { label: 'nav_memberships', to: '/admin/memberships' },
  { label: 'nav_notifications', to: '/admin/notifications' },
]
</script>
