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

      <label style="display: grid; gap: 0.2rem">
        <small class="muted">{{ t('trainer_profile_photo_url') }}</small>
        <input v-model="form.photo_url" class="input" type="text">
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

const saving = ref(false)
const form = reactive({
  full_name: '',
  bio: '',
  photo_url: '',
  certifications_csv: '',
})

const { data: profile, pending } = await useAsyncData<TrainerMeProfile>(
  'trainer-me-profile',
  () => api.get<TrainerMeProfile>('/trainers/me'),
)

const hydrate = (value: TrainerMeProfile | null) => {
  if (!value) return
  form.full_name = value.full_name || ''
  form.bio = value.bio || ''
  form.photo_url = value.photo_url || ''
  form.certifications_csv = (value.certifications || []).join(', ')
}

hydrate(profile.value)

const disciplineNames = computed(() =>
  (profile.value?.disciplines || []).map((d) => d.discipline_name).join(', '),
)

const save = async () => {
  saving.value = true
  try {
    const updated = await api.request<TrainerMeProfile>('/trainers/me', {
      method: 'PUT',
      body: {
        full_name: form.full_name.trim(),
        bio: form.bio.trim() || null,
        photo_url: form.photo_url.trim() || null,
        certifications: form.certifications_csv
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      },
    })
    profile.value = updated
    hydrate(updated)
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
</style>
