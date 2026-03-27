<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
          <th v-if="rowActions.length > 0">{{ t('crud_actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length + (rowActions.length > 0 ? 1 : 0)" class="muted">{{ t('crud_no_records') }}</td>
        </tr>
        <tr v-for="(row, rowIndex) in rows" :key="row.id || rowIndex">
          <td v-for="column in columns" :key="column.key">
            {{ formatValue(resolvePath(row, column.key), column.type) }}
          </td>
          <td v-if="rowActions.length > 0">
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap">
              <button
                v-for="action in rowActions"
                :key="action.key"
                class="btn"
                type="button"
                :disabled="Boolean(props.actionsDisabled)"
                @click="$emit('row-action', action.key, row)"
              >
                {{ action.label }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { resolveUiMessage } from '~/app/config/uiMessages'

interface CrudColumn {
  key: string
  label: string
  type?: 'text' | 'date' | 'datetime' | 'boolean'
}

const props = defineProps<{
  columns: CrudColumn[]
  rows: Array<Record<string, unknown>>
  rowActions?: Array<{ key: string; label: string }>
  actionsDisabled?: boolean
}>()

defineEmits<{
  'row-action': [actionKey: string, row: Record<string, unknown>]
}>()

const rowActions = computed(() => props.rowActions || [])
const { locale } = useLocale()
const t = (key: string) => resolveUiMessage(key, locale.value)

const resolvePath = (row: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key]
    }

    return undefined
  }, row)
}

const formatValue = (value: unknown, type: CrudColumn['type']) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (type === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (type === 'date' || type === 'datetime') {
    const date = new Date(String(value))
    if (Number.isNaN(date.getTime())) {
      return String(value)
    }

    return type === 'date' ? date.toLocaleDateString() : date.toLocaleString()
  }

  return String(value)
}
</script>
