<template>
  <div>
    <div v-if="showShell" class="app-shell">
      <LayoutRightSidebar />
      <main class="app-main">
        <LayoutAppHeader />
        <section class="app-content">
          <slot />
        </section>
      </main>
    </div>
    <main v-else class="app-main">
      <slot />
    </main>
    <FeedbackToastViewport />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const showShell = computed(() => route.path.startsWith('/admin'))
</script>
