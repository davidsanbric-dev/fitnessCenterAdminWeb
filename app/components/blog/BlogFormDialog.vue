<template>
  <div v-if="open" class="dialog-backdrop">
    <div class="dialog-card panel blog-dialog">
      <h3 style="margin-top: 0">{{ title }}</h3>

      <form style="display: grid; gap: 0.8rem" @submit.prevent="onSubmit">
        <label style="display: grid; gap: 0.25rem">
          <small class="muted">{{ t('blog_field_title') }}</small>
          <input
            v-model="form.title"
            class="input"
            type="text"
            :placeholder="t('blog_field_title_placeholder')"
            :disabled="loading"
          >
        </label>

        <div style="display: grid; gap: 0.25rem">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <small class="muted">{{ t('blog_field_text') }}</small>
            <button class="btn btn-small" type="button" :disabled="loading" @click="showPreview = !showPreview">
              {{ showPreview ? t('blog_preview_edit') : t('blog_preview_show') }}
            </button>
          </div>
          <textarea
            v-if="!showPreview"
            v-model="form.text"
            class="input"
            rows="9"
            :placeholder="t('blog_field_text_placeholder')"
            :disabled="loading"
          />
          <!-- eslint-disable-next-line vue/no-v-html -- content is escaped in renderMarkdown -->
          <div v-else class="markdown-preview panel" v-html="renderedText" />
        </div>

        <div style="display: grid; gap: 0.25rem">
          <small class="muted">{{ t('blog_field_hero') }}</small>
          <input
            ref="fileInput"
            class="input"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            :disabled="loading"
            @change="onFileChange"
          >
          <small class="muted" style="font-size: 0.72rem">{{ t('blog_field_hero_hint') }}</small>
          <img v-if="previewImage" :src="previewImage" alt="" class="hero-preview">
        </div>

        <small v-if="error" style="color: var(--danger)">{{ error }}</small>

        <div style="display: flex; justify-content: flex-end; gap: 0.55rem; margin-top: 0.35rem">
          <button class="btn" type="button" :disabled="loading" @click="$emit('cancel')">{{ t('crud_cancel') }}</button>
          <button class="btn btn-primary" type="submit" :disabled="loading">
            {{ loading ? t('crud_processing') : confirmLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import { renderMarkdown } from '~/composables/useMarkdown'
import { useT } from '~/composables/useT'

export interface BlogFormValues {
  title: string
  text: string
  // base64 data URL of a newly selected image, or null to keep the existing one
  hero_image: string | null
}

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  title: string
  confirmLabel: string
  loading?: boolean
  error?: string
  initialTitle?: string
  initialText?: string
  initialImageUrl?: string
}>()

const emit = defineEmits<{
  cancel: []
  submit: [values: BlogFormValues]
}>()

const t = useT()

const form = reactive({ title: '', text: '' })
const heroDataUrl = ref<string | null>(null)
const showPreview = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const renderedText = computed(() => renderMarkdown(form.text))
// Show the freshly picked image, else the existing one (edit mode).
const previewImage = computed(() => heroDataUrl.value || props.initialImageUrl || '')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.title = props.initialTitle || ''
      form.text = props.initialText || ''
      heroDataUrl.value = null
      showPreview.value = false
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
  },
)

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    heroDataUrl.value = null
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    heroDataUrl.value = typeof reader.result === 'string' ? reader.result : null
  }
  reader.readAsDataURL(file)
}

const onSubmit = () => {
  emit('submit', {
    title: form.title.trim(),
    text: form.text,
    hero_image: heroDataUrl.value,
  })
}
</script>

<style scoped>
.blog-dialog {
  width: min(640px, 92vw);
  max-height: 88vh;
  overflow-y: auto;
}

.hero-preview {
  margin-top: 0.4rem;
  max-height: 160px;
  width: auto;
  max-width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  object-fit: cover;
}

.markdown-preview {
  padding: 0.75rem;
  min-height: 9rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.btn-small {
  padding: 0.15rem 0.5rem;
  font-size: 0.75rem;
}
</style>
