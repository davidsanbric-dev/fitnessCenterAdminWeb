<template>
  <div v-if="toasts.length > 0" class="toast-viewport" aria-live="polite" aria-atomic="true">
    <article
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-item"
      :class="`toast-${toast.kind}`"
      role="status"
    >
      <p style="margin: 0">{{ toast.message }}</p>
      <button class="btn" type="button" @click="removeToast(toast.id)">Dismiss</button>
    </article>
  </div>
</template>

<script setup lang="ts">
const {
  toasts,
  removeToast,
} = useToasts()
</script>