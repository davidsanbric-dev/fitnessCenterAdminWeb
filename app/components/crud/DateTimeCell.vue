<template>
  <span v-if="!parsed" class="dt-cell dt-cell--raw">{{ fallback }}</span>
  <span v-else class="dt-cell" :title="parsed.title">
    <span class="dt-cell__row dt-cell__date">
      <Calendar class="dt-cell__icon" :size="14" :stroke-width="2" aria-hidden="true" />
      <span>{{ parsed.date }}</span>
    </span>
    <span v-if="mode === 'datetime'" class="dt-cell__row dt-cell__time">
      <Clock class="dt-cell__icon" :size="13" :stroke-width="2" aria-hidden="true" />
      <span>{{ parsed.time }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Clock } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    value: unknown
    mode?: 'date' | 'datetime'
  }>(),
  { mode: 'datetime' },
)

const { locale } = useLocale()

const fallback = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') {
    return '-'
  }

  return String(props.value)
})

const parsed = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') {
    return null
  }

  const date = new Date(String(props.value))
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const localeTag = locale.value === 'es' ? 'es-ES' : 'en-US'

  return {
    date: new Intl.DateTimeFormat(localeTag, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date),
    time: new Intl.DateTimeFormat(localeTag, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date),
    title: date.toLocaleString(localeTag),
  }
})
</script>

<style scoped>
.dt-cell {
  display: inline-flex;
  flex-direction: column;
  gap: 0.1rem;
  line-height: 1.25;
  white-space: nowrap;
  vertical-align: middle;
}

.dt-cell__row {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.dt-cell__date {
  color: var(--text);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.dt-cell__time {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.dt-cell__icon {
  flex: none;
  opacity: 0.7;
}

.dt-cell__date .dt-cell__icon {
  color: var(--primary);
  opacity: 0.85;
}

.dt-cell--raw {
  color: var(--text-muted);
}
</style>
