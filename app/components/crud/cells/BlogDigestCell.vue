<template>
  <!-- Compound cell: blog hero image with the title and creation datetime. -->
  <div class="cc">
    <img v-if="imageUrl" :src="String(imageUrl)" alt="" class="cc__thumb">
    <span class="cc__title">{{ text(title) }}</span>
    <CrudDateTimeCell :value="createdAt" mode="datetime" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: unknown; createdAt: unknown; imageUrl?: unknown }>()

const text = (value: unknown) => (value === null || value === undefined || value === '' ? '—' : String(value))
</script>
