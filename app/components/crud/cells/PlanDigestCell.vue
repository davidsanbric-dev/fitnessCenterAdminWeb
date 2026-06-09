<template>
  <!-- Compound cell: membership plan name with price, duration and monthly cap. -->
  <div class="cc">
    <span class="cc__title">{{ text(name) }}</span>
    <div class="cc__inline">
      <div class="cc__field">
        <span class="cc__label">{{ t('col_price') }}</span>
        <span class="cc__value">{{ text(price) }}</span>
      </div>
      <div class="cc__field">
        <span class="cc__label">{{ t('col_duration_days') }}</span>
        <span class="cc__value cc__value--muted">{{ text(durationDays) }}</span>
      </div>
      <div class="cc__field">
        <span class="cc__label">{{ t('col_max_bookings') }}</span>
        <span class="cc__value cc__value--muted">{{ text(maxBookings) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveUiMessage } from '~/config/uiMessages'

defineProps<{ name: unknown; price: unknown; durationDays: unknown; maxBookings: unknown }>()

const { locale } = useLocale()
const t = (key: string) => resolveUiMessage(key, locale.value)
const text = (value: unknown) => (value === null || value === undefined || value === '' ? '—' : String(value))
</script>

<style scoped>
.cc__inline {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
}
</style>
