<template>
  <div class="crud-table-block" :class="{ 'has-mobile-cards': Boolean(mobile) }">
    <!-- Desktop / wide layout: the standard column-per-field table. -->
    <div class="table-wrap crud-desktop">
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
              <CrudStatusBadge
                v-else-if="column.type === 'status'"
                :value="resolvePath(row, column.key)"
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

    <!-- Mobile layout: each row becomes a card with a compound cell plus a
         "..." more-actions menu collapsing the secondary fields and actions. -->
    <ul v-if="mobile" class="crud-cards">
      <li v-if="rows.length === 0" class="crud-card muted">{{ t('crud_no_records') }}</li>
      <li v-for="(row, rowIndex) in rows" :key="String(row.id ?? rowIndex)" class="crud-card">
        <div class="crud-card__body">
          <CrudCompoundRowCell :variant="mobile.variant" :row="row" />
        </div>
        <CrudMoreActionsMenu
          v-if="menuItemsFor().length > 0"
          :items="menuItemsFor()"
          :label="t('mobile_more_actions')"
          :disabled="Boolean(props.actionsDisabled)"
          @select="(key) => onMenuSelect(key, row)"
        />
      </li>
    </ul>

    <CrudRowDetailsDialog
      :open="details.open"
      :title="details.title"
      :fields="details.fields"
      :close-label="t('crud_close')"
      @close="closeDetails"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import {
  CalendarClock,
  CheckCheck,
  Eye,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from 'lucide-vue-next'

import type { MoreActionItem } from '~/components/crud/MoreActionsMenu.vue'
import type { DetailField } from '~/components/crud/RowDetailsDialog.vue'
import type { MobileCellConfig } from '~/config/adminCrudResources'
import { resolveUiMessage } from '~/config/uiMessages'

interface CrudColumn {
  key: string
  label: string
  labelKey?: string
  type?: 'text' | 'date' | 'datetime' | 'boolean' | 'status'
}

const props = defineProps<{
  columns: CrudColumn[]
  rows: Array<Record<string, unknown>>
  rowActions?: Array<{ key: string; label: string }>
  actionsDisabled?: boolean
  mobile?: MobileCellConfig
}>()

const emit = defineEmits<{
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

// ── Mobile more-actions menu ───────────────────────────────────────────────
// Detail-view entries are keyed "view:<id>" so a menu selection can be routed
// to the read-only dialog; everything else is a genuine row action re-emitted
// to the parent unchanged (so the existing confirm/form flow is reused).
const DETAIL_PREFIX = 'view:'

const menuItemsFor = (): MoreActionItem[] => {
  const items: MoreActionItem[] = []

  for (const view of props.mobile?.detailViews || []) {
    items.push({
      key: `${DETAIL_PREFIX}${view.key}`,
      label: view.labelKey ? resolveUiMessage(view.labelKey, locale.value) : view.label,
      icon: Eye,
    })
  }

  for (const action of rowActions.value) {
    items.push({
      key: action.key,
      label: action.label,
      icon: actionIcon(action.key),
      danger: action.key.includes('delete'),
    })
  }

  return items
}

const details = reactive<{ open: boolean; title: string; fields: DetailField[] }>({
  open: false,
  title: '',
  fields: [],
})

const openDetails = (viewKey: string, row: Record<string, unknown>) => {
  const view = (props.mobile?.detailViews || []).find((item) => item.key === viewKey)
  if (!view) return

  details.title = view.labelKey ? resolveUiMessage(view.labelKey, locale.value) : view.label
  details.fields = view.fields.map((field) => ({
    key: field.key,
    label: field.labelKey ? resolveUiMessage(field.labelKey, locale.value) : field.label,
    value: resolvePath(row, field.key),
    type: field.type,
  }))
  details.open = true
}

const closeDetails = () => {
  details.open = false
}

const onMenuSelect = (key: string, row: Record<string, unknown>) => {
  if (key.startsWith(DETAIL_PREFIX)) {
    openDetails(key.slice(DETAIL_PREFIX.length), row)
    return
  }

  emit('row-action', key, row)
}
</script>
