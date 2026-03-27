<template>
  <div>
    <div v-if="showShell" class="app-shell">
      <RightSidebar />
      <main class="app-main">
        <AppHeader />
        <section class="app-content">
          <slot />
        </section>
      </main>
    </div>
    <main v-else class="app-main">
      <slot />
    </main>
    <ToastViewport />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import RightSidebar from '~/components/layout/RightSidebar.vue'
import ToastViewport from '~/components/feedback/ToastViewport.vue'

const route = useRoute()

const showShell = computed(() => route.path.startsWith('/admin'))
</script>
