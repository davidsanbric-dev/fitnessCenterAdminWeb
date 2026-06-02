<template>
  <section>
    <header style="margin-bottom: 1rem">
      <h2 class="section-title">{{ t('admin_home_title') }}</h2>
      <p class="section-subtitle">{{ t('admin_home_subtitle') }}</p>
    </header>

    <div class="grid-kpi">
      <article v-for="item in cards" :key="item.label" class="panel kpi-card">
        <p class="kpi-label">{{ item.label }}</p>
        <p class="kpi-value">{{ item.value }}</p>
      </article>
    </div>

    <article class="panel" style="padding: 0.9rem">
      <h3 style="margin-top: 0">{{ t('status_breakdown_title') }}</h3>
      <ul>
        <li v-for="(value, key) in statusBreakdown" :key="key" style="margin-bottom: 0.3rem">
          <strong>{{ key }}</strong>: {{ value }}
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import { resolveUiMessage } from '~/app/config/uiMessages'

interface AdminHomeResponse {
  kpis: {
    total_bookings: number
    confirmed_bookings: number
    cancelled_bookings: number
    upcoming_bookings: number
    total_memberships: number
    unread_notifications: number
  }
  status_breakdown: Record<string, number>
}

const api = useApiClient()
const { locale } = useLocale()

const t = (key: string) => resolveUiMessage(key, locale.value)

const { data: dashboard } = await useAsyncData<AdminHomeResponse>(
  'admin-home-dashboard',
  () => api.get<AdminHomeResponse>('/admin/home'),
)

const statusBreakdown = computed(() => dashboard.value?.status_breakdown || {})

const cards = computed(() => {
  const kpi = dashboard.value?.kpis

  if (!kpi) {
    return []
  }

  return [
    { label: t('kpi_total_bookings'), value: kpi.total_bookings },
    { label: t('kpi_confirmed'), value: kpi.confirmed_bookings },
    { label: t('kpi_cancelled'), value: kpi.cancelled_bookings },
    { label: t('kpi_upcoming'), value: kpi.upcoming_bookings },
    { label: t('kpi_memberships'), value: kpi.total_memberships },
    { label: t('kpi_unread_notifications'), value: kpi.unread_notifications },
  ]
})
</script>
