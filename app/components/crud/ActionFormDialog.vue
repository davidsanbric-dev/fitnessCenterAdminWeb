<template>
  <div v-if="open" class="dialog-backdrop">
    <div class="dialog-card panel">
      <h3 style="margin-top: 0">{{ title }}</h3>
      <p class="muted" style="margin-bottom: 0.85rem">{{ description }}</p>

      <form style="display: grid; gap: 0.7rem" @submit.prevent="$emit('submit', formValues)">
        <template v-for="field in fields" :key="field.key" style="display: grid; gap: 0.25rem">
          <small class="muted">{{ field.labelKey ? t(field.labelKey) : field.label }}</small>

          <select
            v-if="field.type === 'select'"
            class="input"
            :value="String(formValues[field.key] || '')"
            :disabled="loading"
            @change="setValue(field.key, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="option in field.options || []" :key="option.value" :value="option.value">
              {{ option.labelKey ? t(option.labelKey) : option.label }}
            </option>
          </select>

          <textarea
            v-else-if="field.type === 'textarea'"
            class="input"
            :placeholder="field.placeholderKey ? t(field.placeholderKey) : (field.placeholder || '')"
            :value="String(formValues[field.key] || '')"
            :disabled="loading"
            rows="3"
            @input="setValue(field.key, ($event.target as HTMLTextAreaElement).value)"
          />

          <input
            v-else-if="field.type === 'datetime'"
            class="input"
            type="datetime-local"
            :min="nowDatetimeLocal"
            :value="toDatetimeLocalValue(String(formValues[field.key] || ''))"
            :disabled="loading"
            @input="setValue(field.key, ($event.target as HTMLInputElement).value)"
          >

          <input
            v-else
            class="input"
            :type="field.type === 'number' ? 'number' : 'text'"
            :placeholder="field.placeholderKey ? t(field.placeholderKey) : (field.placeholder || '')"
            :value="String(formValues[field.key] || '')"
            :disabled="loading"
            @input="setValue(field.key, ($event.target as HTMLInputElement).value)"
          >
        </template>

        <small v-if="error" style="color: var(--danger)">{{ error }}</small>

        <div style="display: flex; justify-content: flex-end; gap: 0.55rem; margin-top: 0.35rem">
          <button class="btn" type="button" :disabled="loading" @click="$emit('cancel')">{{ t('crud_cancel') }}</button>
          <button class="btn btn-primary" type="submit" :disabled="loading">
            {{ loading ? t('crud_processing') : confirmLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

import { resolveUiMessage } from '~/config/uiMessages'

export interface ActionFormField {
  key: string
  label: string
  labelKey?: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'datetime'
  required?: boolean
  placeholder?: string
  placeholderKey?: string
  options?: Array<{ label: string; value: string; labelKey?: string }>
  defaultValue?: string | number
}

const props = defineProps<{
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  error?: string
  fields: ActionFormField[]
  initialValues?: Record<string, string | number>
}>()

const formValues = reactive<Record<string, string | number>>({})

const resetValues = () => {
  for (const field of props.fields) {
    const initialValue = props.initialValues?.[field.key]
    formValues[field.key] = initialValue ?? field.defaultValue ?? ''
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetValues()
    }
  },
)

const setValue = (key: string, value: string) => {
  formValues[key] = value
}

// datetime-local requires "YYYY-MM-DDTHH:MM" — strip seconds/timezone if present
const toDatetimeLocalValue = (v: string) => v.slice(0, 16)

// Recomputed each time the dialog opens so "now" stays accurate
const nowDatetimeLocal = computed(() => toDatetimeLocalValue(new Date().toISOString()))

defineEmits<{
  cancel: []
  submit: [values: Record<string, string | number>]
}>()

const { locale } = useLocale()
const t = (key: string) => resolveUiMessage(key, locale.value)
</script>
