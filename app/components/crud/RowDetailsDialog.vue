<template>
  <!-- Read-only "View details" dialog opened from the mobile more-actions menu. -->
  <div v-if="open" class="dialog-backdrop" @click.self="$emit('close')">
    <div class="dialog-card panel">
      <h3 style="margin-top: 0">{{ title }}</h3>

      <div class="details-list">
        <div v-for="field in fields" :key="field.key" class="details-row">
          <span class="details-row__label">{{ field.label }}</span>
          <CrudDateTimeCell
            v-if="field.type === 'date' || field.type === 'datetime'"
            :value="field.value"
            :mode="field.type"
          />
          <CrudStatusBadge v-else-if="field.type === 'status'" :value="field.value" />
          <span v-else class="details-row__value">{{ format(field.value) }}</span>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end">
        <button class="btn" type="button" @click="$emit('close')">{{ closeLabel }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface DetailField {
  key: string
  label: string
  value: unknown
  // Mirrors a column type; 'image' is accepted for assignment compatibility but
  // detail rows render every non-date/status value through format() as text.
  type?: 'text' | 'date' | 'datetime' | 'boolean' | 'status' | 'image'
}

defineProps<{ open: boolean; title: string; fields: DetailField[]; closeLabel: string }>()
defineEmits<{ close: [] }>()

const format = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.length ? value.map((item) => String(item)).join(', ') : '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}
</script>
