<template>
  <div>
    <div v-if="showShell" class="app-shell">
      <RightSidebar />
      <main class="app-main">
        <div class="mobile-topbar">
          <button class="btn sidebar-toggle" type="button" @click="toggleSidebar" aria-label="Toggle navigation">
            <Menu :size="18" />
          </button>
        </div>
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
import RightSidebar from '~/components/layout/Sidebar.vue'
import ToastViewport from '~/components/feedback/ToastViewport.vue'
import { useSidebar } from '~/composables/useSidebar'
import { useNotificationsFeed } from '~/composables/useNotificationsFeed'
import { Menu } from 'lucide-vue-next'

const route = useRoute()
const { toggleSidebar } = useSidebar()

const showShell = computed(() => route.path.startsWith('/admin'))

// Drive the live notification poller from the authenticated admin shell only:
// start while inside /admin (signed-in staff/trainer), stop on logout/leave.
const notificationsFeed = useNotificationsFeed()

onMounted(() => {
  watch(
    showShell,
    (inShell) => {
      if (inShell) {
        notificationsFeed.start()
      } else {
        notificationsFeed.stop()
      }
    },
    { immediate: true },
  )
})

onBeforeUnmount(() => notificationsFeed.stop())
</script>
