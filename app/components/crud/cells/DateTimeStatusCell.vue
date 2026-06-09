<template>
  <!-- Compound cell: booking datetime stacked above its status badge. -->
  <div class="cc__stack">
    <CrudDateTimeCell :value="datetime" mode="datetime" />
    <CrudStatusBadge :value="status" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ datetime: unknown; status: unknown }>()
</script>
