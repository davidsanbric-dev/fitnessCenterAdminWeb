<template>
  <!--
    "..." more-actions dropdown used by the mobile card layout to collapse the
    secondary fields (View Details / View Bio) and row actions (edit, delete,
    update status...) behind a single compact trigger.
  -->
  <div ref="root" class="more-menu">
    <button
      class="btn btn-icon"
      type="button"
      :disabled="disabled"
      :aria-label="label"
      :title="label"
      :aria-haspopup="true"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <MoreHorizontal :size="16" />
    </button>

    <div v-if="open" class="more-menu__panel" role="menu">
      <button
        v-for="item in items"
        :key="item.key"
        class="more-menu__item"
        :class="{ 'more-menu__item--danger': item.danger }"
        type="button"
        role="menuitem"
        @click.stop="select(item.key)"
      >
        <component :is="item.icon" v-if="item.icon" :size="15" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { MoreHorizontal } from 'lucide-vue-next'

export interface MoreActionItem {
  key: string
  label: string
  icon?: unknown
  danger?: boolean
}

defineProps<{ items: MoreActionItem[]; label: string; disabled?: boolean }>()
const emit = defineEmits<{ select: [key: string] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const toggle = () => {
  open.value = !open.value
}
const close = () => {
  open.value = false
}
const select = (key: string) => {
  close()
  emit('select', key)
}

// Close on any outside click so only one menu is ever open at a time.
const onDocumentClick = (event: MouseEvent) => {
  if (root.value && !root.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>
