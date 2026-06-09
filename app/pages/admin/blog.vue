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
    @change-page="resource.fetchPage"
  >
    <template #actions>
      <button class="btn btn-primary" type="button" :disabled="busy" @click="openCreate">
        {{ t('blog_action_create') }}
      </button>
    </template>

    <template #table>
      <div class="crud-table-block has-mobile-cards">
        <!-- Desktop / wide layout: datetime-title-image columns. -->
        <div class="table-wrap crud-desktop">
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
                <td><CrudDateTimeCell :value="row.created_at" mode="datetime" /></td>
                <td>
                  <div style="display: flex; gap: 0.35rem; flex-wrap: wrap">
                    <button
                      class="btn btn-icon"
                      type="button"
                      :disabled="busy"
                      :title="t('blog_action_edit')"
                      :aria-label="t('blog_action_edit')"
                      @click="openEdit(row)"
                    >
                      <Pencil :size="14" />
                    </button>
                    <button
                      class="btn btn-icon btn-danger"
                      type="button"
                      :disabled="busy"
                      :title="t('blog_action_delete')"
                      :aria-label="t('blog_action_delete')"
                      @click="askDelete(row)"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile layout: datetime-title-image compound cell + more-actions. -->
        <ul class="crud-cards">
          <li v-if="resource.rows.value.length === 0" class="crud-card muted">{{ t('blog_empty') }}</li>
          <li v-for="row in (resource.rows.value as BlogRow[])" :key="row.id" class="crud-card">
            <div class="crud-card__body">
              <CrudCellsBlogDigestCell
                :title="row.title"
                :created-at="row.created_at"
                :image-url="imageSrc(row)"
              />
            </div>
            <CrudMoreActionsMenu
              :items="blogMenuItems"
              :label="t('mobile_more_actions')"
              :disabled="busy"
              @select="(key) => onBlogMenuSelect(key, row)"
            />
          </li>
        </ul>
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
import { computed, onMounted, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { Pencil, Trash2 } from 'lucide-vue-next'

import type { BlogFormValues } from '~/components/blog/BlogFormDialog.vue'
import type { MoreActionItem } from '~/components/crud/MoreActionsMenu.vue'
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

// Load the first page on mount. Without this the list only populates after a
// create/refresh, so a fresh page load (e.g. after re-login) showed nothing.
onMounted(() => {
  resource.fetchPage(1)
})

const imageSrc = (row: BlogRow) => (row.hero_image_url ? `${apiBaseUrl}${row.hero_image_url}` : '')

// Mobile more-actions menu mirrors the desktop edit/delete icon buttons.
const blogMenuItems = computed<MoreActionItem[]>(() => [
  { key: 'edit', label: t('blog_action_edit'), icon: Pencil },
  { key: 'delete', label: t('blog_action_delete'), icon: Trash2, danger: true },
])

const onBlogMenuSelect = (key: string, row: BlogRow) => {
  if (key === 'edit') {
    openEdit(row)
  } else if (key === 'delete') {
    askDelete(row)
  }
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
