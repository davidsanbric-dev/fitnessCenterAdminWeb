<template>
  <!-- Compound cell: trainer name as the title with their discipline below. -->
  <div class="cc">
    <span class="cc__title">{{ text(name) }}</span>
    <div class="cc__field">
      <span class="cc__label">{{ t('col_discipline') }}</span>
      <span class="cc__value cc__value--muted">{{ text(discipline) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveUiMessage } from '~/config/uiMessages'

defineProps<{ name: unknown; discipline: unknown }>()

const { locale } = useLocale()
const t = (key: string) => resolveUiMessage(key, locale.value)
const text = (value: unknown) => (value === null || value === undefined || value === '' ? '—' : String(value))
</script>
