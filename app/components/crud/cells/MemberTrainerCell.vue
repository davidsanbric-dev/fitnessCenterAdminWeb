<template>
  <!-- Compound cell: member name with the assigned trainer below it. The trainer
       line is omitted when absent (e.g. the trainer-scoped bookings view). -->
  <div class="cc">
    <div class="cc__field">
      <span class="cc__label">{{ t('col_member') }}</span>
      <span class="cc__value">{{ text(member) }}</span>
    </div>
    <div v-if="hasTrainer" class="cc__field">
      <span class="cc__label">{{ t('col_trainer') }}</span>
      <span class="cc__value cc__value--muted">{{ text(trainer) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'

const props = defineProps<{ member: unknown; trainer?: unknown }>()

const t = useT()
const text = (value: unknown) => (value === null || value === undefined || value === '' ? '—' : String(value))
const hasTrainer = computed(
  () => props.trainer !== null && props.trainer !== undefined && props.trainer !== '',
)
</script>
