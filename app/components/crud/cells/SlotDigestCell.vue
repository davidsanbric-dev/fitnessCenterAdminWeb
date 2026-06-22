<template>
  <!-- Compound cell (trainer role): slot datetime, discipline, availability and type. -->
  <div class="cc">
    <CrudDateTimeCell :value="datetime" mode="datetime" />
    <div class="cc__inline">
      <span v-if="discipline" class="cc__value cc__value--muted">{{ discipline }}</span>
      <span v-if="scheduleType" class="cc__value cc__value--muted">{{ scheduleType }}</span>
    </div>
    <span class="status-badge" :class="available ? 'status-badge--confirmed' : 'status-badge--cancelled'">
      <span class="status-badge__dot" aria-hidden="true" />
      {{ available ? t('slot_available') : t('slot_unavailable') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'

const props = defineProps<{
  datetime: unknown
  discipline?: unknown
  isAvailable: unknown
  scheduleType?: unknown
}>()

const t = useT()
const available = computed(() => props.isAvailable === true || String(props.isAvailable) === 'true')
</script>

<style scoped>
.cc__inline {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}
</style>
