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
        <tr v-for="(row, rowIndex) in rows" :key="String(row.id ?? rowIndex)">
          <td v-for="column in columns" :key="column.key">
            <CrudDateTimeCell
              v-if="column.type === 'date' || column.type === 'datetime'"
              :value="resolvePath(row, column.key)"
              :mode="column.type"
            />
            <template v-else>{{ formatValue(resolvePath(row, column.key), column.type) }}</template>
          </td>
          <td v-if="rowActions.length > 0">
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap">
              <button
                v-for="action in rowActions"
                :key="action.key"
                class="btn btn-icon"
                :class="actionVariantClass(action.key)"
                type="button"
                :title="action.label"
                :aria-label="action.label"
                :disabled="Boolean(props.actionsDisabled)"
                @click="$emit('row-action', action.key, row)"
              >
                <component :is="actionIcon(action.key)" v-if="actionIcon(action.key)" :size="14" />
                <span v-else>{{ action.label }}</span>
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
import {
  CalendarClock,
  CheckCheck,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from 'lucide-vue-next'

import { resolveUiMessage } from '~/config/uiMessages'

interface CrudColumn {
  key: string
  label: string
  labelKey?: string
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

const ACTION_ICONS: Record<string, unknown> = {
  Pencil,
  Trash2,
  CheckCheck,
  CalendarClock,
  SlidersHorizontal,
}

const actionIcon = (key: string) => {
  if (key.includes('delete')) return ACTION_ICONS.Trash2
  if (key.includes('mark_read')) return ACTION_ICONS.CheckCheck
  if (key.includes('reschedule')) return ACTION_ICONS.CalendarClock
  if (key.includes('toggle')) return ACTION_ICONS.SlidersHorizontal
  if (key.includes('edit') || key.includes('update')) return ACTION_ICONS.Pencil
  return null
}

const actionVariantClass = (key: string) => {
  if (key.includes('delete')) return 'btn-danger'
  if (key.includes('mark_read')) return 'btn-success'
  return ''
}
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

  // Date/datetime columns are rendered by CrudDateTimeCell in the template.

  return String(value)
}
</script>
