<template>
  <span class="status-badge" :class="`status-badge--${tone}`">
    <span class="status-badge__dot" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: unknown }>()

const normalized = computed(() => String(props.value ?? '').trim().toUpperCase())

const tone = computed(() => {
  switch (normalized.value) {
    case 'CONFIRMED':
      return 'confirmed'
    case 'PENDING':
      return 'pending'
    case 'CANCELLED':
    case 'CANCELED':
      return 'cancelled'
    case 'COMPLETED':
      return 'completed'
    default:
      return 'neutral'
  }
})

const label = computed(() => {
  const raw = normalized.value
  if (!raw) return '-'
  return raw.charAt(0) + raw.slice(1).toLowerCase()
})
</script>

<style scoped>
.status-badge {
  --badge-color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.01em;
  white-space: nowrap;
  color: var(--badge-color);
  background: color-mix(in srgb, var(--badge-color) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--badge-color) 34%, transparent);
}

.status-badge__dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--badge-color);
  flex: none;
}

.status-badge--confirmed {
  --badge-color: #36a85b;
}

.status-badge--pending {
  --badge-color: #d99e2b;
}

.status-badge--cancelled {
  --badge-color: #d6504f;
}

.status-badge--completed {
  --badge-color: #4a90d9;
}

.status-badge--neutral {
  --badge-color: var(--text-muted);
}
</style>
