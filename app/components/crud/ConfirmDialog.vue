<template>
  <div v-if="open" class="dialog-backdrop">
    <div class="dialog-card panel">
      <h3 style="margin-top: 0">{{ title }}</h3>
      <p class="muted" style="margin-bottom: 1rem">{{ messageKey ? t(messageKey) : message }}</p>
      <div style="display: flex; justify-content: flex-end; gap: 0.55rem">
        <button class="btn" type="button" :disabled="loading" @click="$emit('cancel')">{{ t('crud_cancel') }}</button>
        <button class="btn btn-primary" type="button" :disabled="loading" @click="$emit('confirm')">
          {{ loading ? t('crud_processing') : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'

defineProps<{
  open: boolean
  title: string
  message: string
  messageKey?: string
  confirmLabel?: string
  loading?: boolean
}>()

defineEmits<{
  cancel: []
  confirm: []
}>()

const t = useT()
</script>
