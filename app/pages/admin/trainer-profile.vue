<template>
  <section>
    <header style="margin-bottom: 1rem">
      <h2 class="section-title">{{ t('trainer_profile_title') }}</h2>
      <p class="section-subtitle">{{ t('trainer_profile_subtitle') }}</p>
    </header>

    <p v-if="pending" class="muted">{{ t('trainer_profile_loading') }}</p>

    <form v-else-if="profile" class="panel" style="padding: 1rem; display: grid; gap: 0.8rem; max-width: 640px" @submit.prevent="save">
      <div class="readonly-row">
        <small class="muted">{{ t('trainer_profile_email') }}</small>
        <span>{{ profile.email }}</span>
      </div>
      <div class="readonly-row">
        <small class="muted">{{ t('trainer_profile_code') }}</small>
        <span>{{ profile.trainer_code }}</span>
      </div>
      <div class="readonly-row">
        <small class="muted">{{ t('trainer_profile_disciplines') }}</small>
        <span>{{ disciplineNames || '—' }}</span>
      </div>

      <label style="display: grid; gap: 0.2rem">
        <small class="muted">{{ t('trainer_profile_full_name') }}</small>
        <input v-model="form.full_name" class="input" type="text">
      </label>

      <label style="display: grid; gap: 0.2rem">
        <small class="muted">{{ t('trainer_profile_bio') }}</small>
        <textarea v-model="form.bio" class="input" rows="3" />
      </label>

      <label style="display: grid; gap: 0.4rem">
        <small class="muted">{{ t('trainer_profile_photo') }}</small>
        <img v-if="previewImage" :src="previewImage" alt="" class="photo-preview">
        <input
          ref="fileInput"
          class="input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          @change="onFileChange"
        >
        <small class="muted" style="font-size: 0.72rem">{{ t('trainer_profile_photo_hint') }}</small>
      </label>

      <label style="display: grid; gap: 0.2rem">
        <small class="muted">{{ t('trainer_profile_certifications') }}</small>
        <input v-model="form.certifications_csv" class="input" type="text">
      </label>

      <div>
        <button class="btn btn-primary" type="submit" :disabled="saving">{{ t('trainer_profile_save') }}</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { resolveUiMessage } from '~/config/uiMessages'
import { useApiClient } from '~/composables/useApiClient'

interface TrainerMeProfile {
  trainer_id: number
  trainer_code: number
  full_name: string
  email: string
  bio: string | null
  photo_url: string | null
  certifications: string[]
  location_id: number | null
  disciplines: Array<{ discipline_id: number; discipline_code: string; discipline_name: string }>
}

const api = useApiClient()
const toasts = useToasts()
const { locale } = useLocale()
const t = (key: string) => resolveUiMessage(key, locale.value)

const config = useRuntimeConfig()
const apiBaseUrl = String(config.public.apiBaseUrl || '')

const saving = ref(false)
const form = reactive({
  full_name: '',
  bio: '',
  certifications_csv: '',
})

// base64 data URL of a freshly picked photo, or null to keep the current one.
const photoDataUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const absolutePhotoUrl = (path: string | null | undefined): string => {
  const value = (path || '').trim()
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `${apiBaseUrl}${value}`
}

// Show the freshly picked photo, else the stored one (served media URL).
const previewImage = computed(() => photoDataUrl.value || absolutePhotoUrl(profile.value?.photo_url))

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    photoDataUrl.value = null
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    photoDataUrl.value = typeof reader.result === 'string' ? reader.result : null
  }
  reader.readAsDataURL(file)
}

const { data: profile, pending } = await useAsyncData<TrainerMeProfile>(
  'trainer-me-profile',
  () => api.get<TrainerMeProfile>('/trainers/me'),
)

const hydrate = (value: TrainerMeProfile | null) => {
  if (!value) return
  form.full_name = value.full_name || ''
  form.bio = value.bio || ''
  form.certifications_csv = (value.certifications || []).join(', ')
}

hydrate(profile.value)

const disciplineNames = computed(() =>
  (profile.value?.disciplines || []).map((d) => d.discipline_name).join(', '),
)

const save = async () => {
  saving.value = true
  try {
    const body: Record<string, unknown> = {
      full_name: form.full_name.trim(),
      bio: form.bio.trim() || null,
      certifications: form.certifications_csv
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    }
    // Only send the photo when a new one was picked; the server transcodes it to
    // WebP and derives photo_url from the stored filename.
    if (photoDataUrl.value) {
      body.photo_image = photoDataUrl.value
    }
    const updated = await api.request<TrainerMeProfile>('/trainers/me', {
      method: 'PUT',
      body,
    })
    profile.value = updated
    hydrate(updated)
    photoDataUrl.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    toasts.pushSuccess(t('trainer_profile_save_success'))
  } catch {
    toasts.pushError(t('trainer_profile_save_error'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.readonly-row {
  display: grid;
  gap: 0.2rem;
}

.photo-preview {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid var(--border);
  display: block;
}
</style>
