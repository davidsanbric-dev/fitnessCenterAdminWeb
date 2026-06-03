<template>
  <CrudPageTemplate
    :title="t('blog_title')"
    :description="t('blog_subtitle')"
    :columns="[]"
    :rows="resource.rows.value"
    :loading="resource.loading.value"
    :page="resource.page.value"
    :page-size="resource.pageSize.value"
    :total="resource.total.value"
    @refresh="resource.fetchPage(resource.page.value)"
    @change-page="resource.fetchPage"
  >
    <template #actions>
      <button class="btn btn-primary" type="button" :disabled="busy" @click="openCreate">
        {{ t('blog_action_create') }}
      </button>
    </template>

    <template #table>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 96px">{{ t('blog_col_image') }}</th>
              <th>{{ t('blog_col_title') }}</th>
              <th>{{ t('blog_col_created') }}</th>
              <th>{{ t('crud_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="resource.rows.value.length === 0">
              <td colspan="4" class="muted">{{ t('blog_empty') }}</td>
            </tr>
            <tr v-for="row in (resource.rows.value as BlogRow[])" :key="row.id">
              <td>
                <img v-if="imageSrc(row)" :src="imageSrc(row)" alt="" class="thumb">
                <span v-else class="muted">—</span>
              </td>
              <td>{{ row.title }}</td>
              <td>{{ formatDate(row.created_at) }}</td>
              <td>
                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap">
                  <button class="btn" type="button" :disabled="busy" @click="openEdit(row)">
                    {{ t('blog_action_edit') }}
                  </button>
                  <button class="btn" type="button" :disabled="busy" @click="askDelete(row)">
                    {{ t('blog_action_delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </CrudPageTemplate>

  <BlogFormDialog
    :open="formOpen"
    :mode="formMode"
    :title="formMode === 'create' ? t('blog_dialog_create_title') : t('blog_dialog_edit_title')"
    :confirm-label="formMode === 'create' ? t('blog_action_create') : t('blog_action_edit')"
    :loading="busy"
    :error="formError"
    :initial-title="selected?.title"
    :initial-text="selected?.text"
    :initial-image-url="selected ? imageSrc(selected) : ''"
    @cancel="closeForm"
    @submit="submitForm"
  />

  <CrudConfirmDialog
    :open="deleteOpen"
    :title="t('blog_action_delete')"
    :message="t('blog_confirm_delete')"
    :confirm-label="t('blog_action_delete')"
    :loading="busy"
    @cancel="deleteOpen = false"
    @confirm="confirmDelete"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'

import type { BlogFormValues } from '~/components/blog/BlogFormDialog.vue'
import { useApiClient } from '~/composables/useApiClient'
import { useCrudResource } from '~/composables/useCrudResource'
import { resolveUiMessage } from '~/config/uiMessages'

interface BlogRow extends Record<string, unknown> {
  id: number
  title: string
  text: string
  hero_image_url: string | null
  created_at: string
}

const { locale } = useLocale()
const t = (key: string) => resolveUiMessage(key, locale.value)

const config = useRuntimeConfig()
const apiBaseUrl = String(config.public.apiBaseUrl || '')
const api = useApiClient()
const toasts = useToasts()
const resource = useCrudResource('/blog', { requiresAuth: true })

const busy = ref(false)
const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formError = ref('')
const selected = ref<BlogRow | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<BlogRow | null>(null)

const imageSrc = (row: BlogRow) => (row.hero_image_url ? `${apiBaseUrl}${row.hero_image_url}` : '')

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const openCreate = () => {
  selected.value = null
  formMode.value = 'create'
  formError.value = ''
  formOpen.value = true
}

const openEdit = (row: BlogRow) => {
  selected.value = row
  formMode.value = 'edit'
  formError.value = ''
  formOpen.value = true
}

const closeForm = () => {
  if (busy.value) return
  formOpen.value = false
  selected.value = null
  formError.value = ''
}

const submitForm = async (values: BlogFormValues) => {
  if (!values.title) {
    formError.value = t('blog_error_title_required')
    return
  }
  if (formMode.value === 'create' && !values.hero_image) {
    formError.value = t('blog_error_image_required')
    return
  }

  busy.value = true
  formError.value = ''
  try {
    const payload: Record<string, unknown> = { title: values.title, text: values.text }
    if (values.hero_image) {
      payload.hero_image = values.hero_image
    }

    if (formMode.value === 'create') {
      await api.request('/blog', { method: 'POST', body: payload, requiresAuth: true })
      toasts.pushSuccess(t('blog_create_success'))
    } else if (selected.value) {
      await api.request(`/blog/${selected.value.id}`, { method: 'PUT', body: payload, requiresAuth: true })
      toasts.pushSuccess(t('blog_update_success'))
    }

    formOpen.value = false
    selected.value = null
    await resource.fetchPage(resource.page.value)
  } catch (error) {
    formError.value = extractError(error, t('blog_save_error'))
    toasts.pushError(formError.value)
  } finally {
    busy.value = false
  }
}

const askDelete = (row: BlogRow) => {
  deleteTarget.value = row
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) {
    deleteOpen.value = false
    return
  }
  busy.value = true
  try {
    await api.request(`/blog/${deleteTarget.value.id}`, { method: 'DELETE', requiresAuth: true })
    toasts.pushSuccess(t('blog_delete_success'))
    deleteOpen.value = false
    deleteTarget.value = null
    await resource.fetchPage(resource.page.value)
  } catch (error) {
    toasts.pushError(extractError(error, t('blog_delete_error')))
  } finally {
    busy.value = false
  }
}

const extractError = (error: unknown, fallback: string): string => {
  const data = (error as { data?: { detail?: string } })?.data
  if (data && typeof data.detail === 'string' && data.detail.trim().length > 0) {
    return data.detail
  }
  return fallback
}
</script>

<style scoped>
.thumb {
  width: 80px;
  height: 56px;
  object-fit: cover;
  border-radius: 0.4rem;
  border: 1px solid var(--border);
  display: block;
}
</style>
