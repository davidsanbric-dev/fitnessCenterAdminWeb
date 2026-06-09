<template>
  <!-- Compound cell: discipline name + description with a trainers-count chip. -->
  <div class="cc">
    <div class="cc__heading">
      <span class="cc__title">{{ text(name) }}</span>
      <span v-if="code" class="cc__code">{{ code }}</span>
    </div>
    <div v-if="description" class="cc__field">
      <span class="cc__label">{{ t('col_description') }}</span>
      <span class="cc__value cc__value--muted">{{ description }}</span>
    </div>
    <span class="cc__count">
      <Users :size="13" />
      {{ t('col_trainers_count') }}: {{ Number(trainersCount ?? 0) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import { resolveUiMessage } from '~/config/uiMessages'

defineProps<{ name: unknown; description?: unknown; trainersCount?: unknown; code?: unknown }>()

const { locale } = useLocale()
const t = (key: string) => resolveUiMessage(key, locale.value)
const text = (value: unknown) => (value === null || value === undefined || value === '' ? '—' : String(value))
</script>

<style scoped>
.cc__heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cc__code {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.05rem 0.4rem;
}
</style>
