<template>
  <section>
    <header style="display: flex; justify-content: space-between; align-items: end; margin-bottom: 0.85rem">
      <div>
        <h2 class="section-title">{{ title }}</h2>
        <p class="section-subtitle">{{ description }}</p>
      </div>
      <div style="display: flex; gap: 0.55rem">
        <slot name="actions" />
      </div>
    </header>

    <div style="display: flex; gap: 0.6rem; margin-bottom: 0.75rem; flex-wrap: wrap">
      <slot name="filters" />
    </div>

    <slot name="table">
      <CrudDataTable :columns="columns" :rows="rows" />
    </slot>

    <div class="pagination">
      <small class="muted">{{ t('crud_total') }}: {{ total }}</small>
      <div style="display: flex; gap: 0.55rem">
        <button class="btn" :disabled="page <= 1 || loading" @click="$emit('change-page', page - 1)">{{ t('crud_prev') }}</button>
        <span>{{ t('crud_page') }} {{ page }}</span>
        <button class="btn" :disabled="rows.length < pageSize || loading" @click="$emit('change-page', page + 1)">{{ t('crud_next') }}</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { resolveUiMessage } from '~/config/uiMessages'

interface CrudColumn {
  key: string
  label: string
  type?: 'text' | 'date' | 'datetime' | 'boolean'
}

defineProps<{
  title: string
  description: string
  columns: CrudColumn[]
  rows: Array<Record<string, unknown>>
  loading: boolean
  page: number
  pageSize: number
  total: number
}>()

defineEmits<{
  'change-page': [page: number]
}>()

const { locale } = useLocale()
const t = (key: string) => resolveUiMessage(key, locale.value)
</script>
