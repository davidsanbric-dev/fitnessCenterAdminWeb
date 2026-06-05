<template>
  <section>
    <header style="margin-bottom: 1rem">
      <h2 class="section-title">{{ t(isTrainerHome ? 'trainer_home_title' : 'admin_home_title') }}</h2>
      <p class="section-subtitle">{{ t(isTrainerHome ? 'trainer_home_subtitle' : 'admin_home_subtitle') }}</p>
    </header>

    <div class="grid-kpi">
      <article v-for="item in cards" :key="item.label" class="panel kpi-card">
        <p class="kpi-label">{{ item.label }}</p>
        <p class="kpi-value">{{ item.value }}</p>
      </article>
    </div>

    <!-- Trainer: upcoming slots list. Admin: booking status breakdown. -->
    <article v-if="isTrainerHome" class="panel" style="padding: 0.9rem">
      <h3 style="margin-top: 0">{{ t('trainer_upcoming_slots_title') }}</h3>
      <ul v-if="upcomingSlots.length">
        <li v-for="slot in upcomingSlots" :key="slot.slot_id" style="margin-bottom: 0.4rem">
          <CrudDateTimeCell :value="slot.slot_datetime" mode="datetime" />
          — {{ slot.discipline_name || '—' }}
          ({{ slot.is_available ? t('kpi_available_slots') : t('kpi_booked_slots') }})
        </li>
      </ul>
      <p v-else class="muted">{{ t('trainer_no_upcoming_slots') }}</p>
    </article>

    <article v-else class="panel" style="padding: 0.9rem">
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
import { computed } from 'vue'
import { resolveUiMessage } from '~/config/uiMessages'
import { useAuth } from '~/composables/useAuth'

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

interface TrainerSlot {
  slot_id: number
  slot_datetime: string
  discipline_name: string | null
  is_available: boolean
}

interface TrainerDashboardResponse {
  trainer: { trainer_id: number; full_name: string; trainer_code: number }
  kpis: {
    total_slots: number
    available_slots: number
    upcoming_slots: number
    booked_slots: number
  }
  upcoming_slots: TrainerSlot[]
}

const api = useApiClient()
const auth = useAuth()
const { locale } = useLocale()

const t = (key: string) => resolveUiMessage(key, locale.value)
const isTrainerHome = computed(() => auth.isTrainer.value && !auth.isAdmin.value)

const { data: adminDashboard } = await useAsyncData<AdminHomeResponse | null>(
  'admin-home-dashboard',
  () => (isTrainerHome.value ? Promise.resolve(null) : api.get<AdminHomeResponse>('/admin/home')),
)

const { data: trainerDashboard } = await useAsyncData<TrainerDashboardResponse | null>(
  'trainer-home-dashboard',
  () => (isTrainerHome.value ? api.get<TrainerDashboardResponse>('/trainers/me/dashboard') : Promise.resolve(null)),
)

const statusBreakdown = computed(() => adminDashboard.value?.status_breakdown || {})
const upcomingSlots = computed(() => trainerDashboard.value?.upcoming_slots || [])

const cards = computed(() => {
  if (isTrainerHome.value) {
    const kpi = trainerDashboard.value?.kpis
    if (!kpi) return []
    return [
      { label: t('kpi_total_slots'), value: kpi.total_slots },
      { label: t('kpi_available_slots'), value: kpi.available_slots },
      { label: t('kpi_upcoming_slots'), value: kpi.upcoming_slots },
      { label: t('kpi_booked_slots'), value: kpi.booked_slots },
    ]
  }

  const kpi = adminDashboard.value?.kpis
  if (!kpi) return []
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
