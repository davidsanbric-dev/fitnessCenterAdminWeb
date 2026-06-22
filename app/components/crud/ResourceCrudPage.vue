<template>
  <CrudPageTemplate
    :title="localizedTitle"
    :description="localizedDescription"
    :columns="config.columns"
    :rows="resource.rows.value"
    :loading="resource.loading.value"
    :page="resource.page.value"
    :page-size="resource.pageSize.value"
    :total="resource.total.value"
    @change-page="resource.fetchPage"
  >
    <template #actions>
      <button
        v-if="config.createAction"
        class="btn btn-primary"
        type="button"
        :disabled="actionState.loading"
        @click="onCreateAction"
      >
        {{ createButtonLabel }}
      </button>
    </template>

    <template #filters>
      <template v-for="filter in config.filters || []" :key="filter.key">
        <label v-if="isTextFilter(filter)" style="display: grid; gap: 0.2rem">
          <small class="muted">{{ filterLabel(filter) }}</small>
          <input
            class="input"
            :value="String(resource.query.value[filter.key] || '')"
            type="text"
            :placeholder="filterLabel(filter)"
            @input="onTextFilterChange(filter.key, ($event.target as HTMLInputElement).value)"
          >
        </label>

        <label v-else style="display: grid; gap: 0.2rem">
          <small class="muted">{{ filterLabel(filter) }}</small>
          <select
            class="input"
            :value="String(resource.query.value[filter.key] || '')"
            @change="onSelectFilterChange(filter.key, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="option in filter.options || []" :key="option.value" :value="option.value">
              {{ filterOptionLabel(option as { labelKey?: string; label: string }) }}
            </option>
          </select>
        </label>
      </template>
    </template>

    <template #table>
      <CrudDataTable
        :columns="localizedColumns"
        :rows="resource.rows.value"
        :row-actions="tableRowActions"
        :actions-disabled="actionState.loading"
        :mobile="config.mobile"
        @row-action="onRowAction"
      />
    </template>
  </CrudPageTemplate>

  <CrudConfirmDialog
    :open="actionState.confirmOpen"
    :title="actionState.title"
    :message="actionState.message"
    :confirm-label="actionState.confirmLabel"
    :loading="actionState.loading"
    @cancel="closeActionDialog"
    @confirm="executeAction"
  />

  <CrudActionFormDialog
    :open="actionState.formOpen"
    :title="actionState.title"
    :description="actionState.message"
    :confirm-label="actionState.confirmLabel"
    :loading="actionState.loading"
    :error="actionState.error"
    :fields="selectedActionFormFields"
    :initial-values="actionState.formInitialValues"
    @cancel="closeActionDialog"
    @submit="submitActionForm"
  />
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  watch,
} from 'vue'
import { z } from 'zod'

import type { ActionFormField } from '~/components/crud/ActionFormDialog.vue'

import type { CrudAction, CrudColumn, CrudResourceConfig } from '~/config/adminCrudResources'

import { isTextFilter } from '~/config/adminCrudResources'

import { resolveToastMessage } from '~/config/toastMessages'
import { resolveUiMessage } from '~/config/uiMessages'
import { useApiClient } from '~/composables/useApiClient'
import { useNotificationsFeed } from '~/composables/useNotificationsFeed'
import { getByPath } from '~/utils/objectPath'
import { extractDetail } from '~/utils/httpError'

const props = defineProps<{
  config: CrudResourceConfig
}>()

const resource = useCrudResource(props.config.endpoint, {
  requiresAuth: props.config.requiresAuth,
})

const api = useApiClient()
const toasts = useToasts()
const { locale } = useLocale()
const t = (key: string) => resolveUiMessage(key, locale.value)

const localizedTitle = computed(() => {
  if (props.config.titleKey) {
    return resolveUiMessage(props.config.titleKey, locale.value)
  }

  return props.config.title
})

const localizedDescription = computed(() => {
  if (props.config.descriptionKey) {
    return resolveUiMessage(props.config.descriptionKey, locale.value)
  }

  return props.config.description
})

const localizedColumns = computed(() => {
  type CrudColumnWithLabelKey = CrudColumn & { labelKey: string }

  return (props.config.columns || []).map((col): CrudColumn => ({
    ...col,
    label: (col as CrudColumnWithLabelKey).labelKey
      ? resolveUiMessage((col as CrudColumnWithLabelKey).labelKey, locale.value)
      : col.label,
  }))
})

const tableRowActions = computed(() => (props.config.rowActions || []).map((item) => ({
  key: item.key,
  label: item.labelKey ? resolveUiMessage(item.labelKey, locale.value) : (item.label || ''),
})))

const createButtonLabel = computed(() => {
  if (!props.config.createAction) return ''
  return props.config.createAction.labelKey
    ? resolveUiMessage(props.config.createAction.labelKey, locale.value)
    : props.config.createAction.label
})

const filterLabel = (filter: { labelKey?: string; label: string }) =>
  filter.labelKey ? resolveUiMessage(filter.labelKey, locale.value) : filter.label

const filterOptionLabel = (option: { labelKey?: string; label: string }) =>
  option.labelKey ? resolveUiMessage(option.labelKey, locale.value) : option.label

const actionState = reactive({
  confirmOpen: false,
  formOpen: false,
  loading: false,
  error: '',
  title: t('action_state_title'),
  message: t('action_state_message'),
  confirmLabel: t('action_state_confirm_label'),
  selectedActionKey: '',
  selectedRow: null as Record<string, unknown> | null,
  formValues: {} as Record<string, string | number>,
  formInitialValues: {} as Record<string, string | number>,
})

// Resolve an action by key across the create action and the row actions — the
// two places a CrudAction can be declared on a resource.
const findAction = (key: string): CrudAction | null => {
  if (props.config.createAction && props.config.createAction.key === key) {
    return props.config.createAction
  }

  return (props.config.rowActions || []).find((item) => item.key === key) || null
}

const selectedAction = computed(() => findAction(actionState.selectedActionKey))

const selectedActionFormFields = computed<ActionFormField[]>(() => {
  const hasFields = (selectedAction.value as { formFields?: ActionFormField[] })?.formFields
  return hasFields || []
})

const resolvePathPlaceholders = (template: string, row: Record<string, unknown>) => {
  return template.replace(/\{([^}]+)\}/g, (_, rawKey: string) => {
    const key = rawKey.trim()
    const value = row[key]
    return encodeURIComponent(String(value ?? ''))
  })
}

const resolvePathValue = getByPath

const interpolateMessageTemplate = (
  template: string,
  row: Record<string, unknown>,
  values: Record<string, string | number>,
  extraContext: Record<string, unknown> = {},
) => {
  return template.replace(/\{([^}]+)\}/g, (_, rawToken: string) => {
    const token = rawToken.trim()

    const fromValues = resolvePathValue(values as Record<string, unknown>, token)
    if (fromValues !== undefined && fromValues !== null && String(fromValues).trim().length > 0) {
      return String(fromValues)
    }

    const fromRow = resolvePathValue(row, token)
    if (fromRow !== undefined && fromRow !== null && String(fromRow).trim().length > 0) {
      return String(fromRow)
    }

    const fromExtra = resolvePathValue(extraContext, token)
    if (fromExtra !== undefined && fromExtra !== null && String(fromExtra).trim().length > 0) {
      return String(fromExtra)
    }

    return ''
  })
}

const identifyRow = (row: Record<string, unknown>) => {
  const keys = ['id', 'booking_id', 'membership_plan_id', 'trainer_id', 'discipline_id']
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value) !== '') {
      return `${key}:${String(value)}`
    }
  }

  return ''
}

const applyOptimisticUpdate = (
  actionKey: string,
  method: string,
  row: Record<string, unknown>,
  payload: Record<string, unknown>,
) => {
  if (method === 'POST') {
    return false
  }

  const marker = identifyRow(row)
  if (!marker) {
    return false
  }

  if (method === 'DELETE') {
    resource.rows.value = resource.rows.value.filter((item) => identifyRow(item) !== marker)
    return true
  }

  let patch: Record<string, unknown> = {
    ...payload,
  }

  if (actionKey === 'mark_read') {
    patch = { ...patch, is_read: true }
  }

  resource.rows.value = resource.rows.value.map((item) => {
    if (identifyRow(item) !== marker) {
      return item
    }

    return {
      ...item,
      ...patch,
    }
  })

  return true
}

const resolveSuccessMessage = (
  action: NonNullable<typeof selectedAction.value>,
  row: Record<string, unknown>,
  values: Record<string, string | number>,
) => {
  if (typeof action.successMessageKey === 'string' && action.successMessageKey.trim().length > 0) {
    const keyTemplate = resolveToastMessage(action.successMessageKey, locale.value)
    if (keyTemplate.trim().length > 0) {
      const message = interpolateMessageTemplate(keyTemplate, row, values)
      if (message.trim().length > 0) {
        return message
      }
    }
  }

  if (typeof action.successMessage === 'function') {
    const message = action.successMessage(row, values)
    return String(message || `${action.label} completed.`)
  }

  if (typeof action.successMessage === 'string' && action.successMessage.trim().length > 0) {
    const message = interpolateMessageTemplate(action.successMessage, row, values)
    return message.trim().length > 0 ? message : `${action.label} completed.`
  }

  return `${action.label} completed.`
}

const extractErrorMessage = (error: unknown) => {
  const detail = extractDetail(error)
  if (detail && detail.trim().length > 0) {
    return detail
  }

  const message = (error as { data?: { message?: string } })?.data?.message
  if (typeof message === 'string' && message.trim().length > 0) {
    return message
  }

  if (error instanceof Error) {
    return error.message
  }

  return t('action_error_failed')
}

const resolveErrorMessage = (
  action: NonNullable<typeof selectedAction.value>,
  row: Record<string, unknown>,
  values: Record<string, string | number>,
  error: unknown,
  baseErrorMessage: string,
) => {
  if (typeof action.errorMessageKey === 'string' && action.errorMessageKey.trim().length > 0) {
    const keyTemplate = resolveToastMessage(action.errorMessageKey, locale.value)
    if (keyTemplate.trim().length > 0) {
      const message = interpolateMessageTemplate(keyTemplate, row, values, {
        error_message: baseErrorMessage,
      })
      if (message.trim().length > 0) {
        return message
      }
    }
  }

  if (typeof action.errorMessage === 'function') {
    const message = action.errorMessage(row, values, error)
    if (String(message || '').trim().length > 0) {
      return message
    }
  }

  if (typeof action.errorMessage === 'string' && action.errorMessage.trim().length > 0) {
    const message = interpolateMessageTemplate(action.errorMessage, row, values, {
      error_message: baseErrorMessage,
    })
    return message.trim().length > 0 ? message : baseErrorMessage
  }

  return baseErrorMessage
}

const toFieldInitialValue = (value: unknown): string | number => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(', ')
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (typeof value === 'number') {
    return value
  }

  return String(value ?? '')
}

const openActionFlow = (actionKey: string, row: Record<string, unknown>) => {
  const action = findAction(actionKey)

  if (!action) {
    return
  }

  actionState.selectedActionKey = actionKey
  actionState.selectedRow = row
  const resolvedLabel = action.labelKey
    ? resolveUiMessage(action.labelKey, locale.value)
    : (action.label || '')
  actionState.title = resolvedLabel
  actionState.confirmLabel = resolvedLabel
  actionState.message = action.confirmMessageKey
    ? resolveUiMessage(action.confirmMessageKey, locale.value)
    : (action.confirmMessage || `Confirm action: ${resolvedLabel}?`)
  actionState.error = ''
  actionState.formValues = {}
  actionState.formInitialValues = {}

  for (const field of action.formFields || []) {
    if (field.fromRowPath) {
      const rowValue = resolvePathValue(row, field.fromRowPath)
      actionState.formInitialValues[field.key] = toFieldInitialValue(rowValue)
    } else if (field.defaultValue !== undefined) {
      actionState.formInitialValues[field.key] = field.defaultValue
    }
  }

  if ((action.formFields || []).length > 0) {
    actionState.formOpen = true
    actionState.confirmOpen = false
  } else {
    actionState.confirmOpen = true
    actionState.formOpen = false
  }
}

const onTextFilterChange = async (key: string, value: string) => {
  resource.updateQuery(key, value.trim())
  await resource.fetchPage(1)
}

const onSelectFilterChange = async (key: string, value: string) => {
  if (value === 'true') {
    resource.updateQuery(key, true)
  } else if (value === 'false') {
    resource.updateQuery(key, false)
  } else {
    resource.updateQuery(key, value)
  }
  await resource.fetchPage(1)
}

const onRowAction = async (actionKey: string, row: Record<string, unknown>) => {
  openActionFlow(actionKey, row)
}

const onCreateAction = () => {
  if (!props.config.createAction) {
    return
  }

  openActionFlow(props.config.createAction.key, {})
}

const closeActionDialog = () => {
  if (actionState.loading) {
    return
  }

  actionState.confirmOpen = false
  actionState.formOpen = false
  actionState.selectedActionKey = ''
  actionState.selectedRow = null
  actionState.error = ''
  actionState.formValues = {}
  actionState.formInitialValues = {}
}

const executeAction = async () => {
  const action = selectedAction.value
  if (!action || !actionState.selectedRow) {
    closeActionDialog()
    return
  }

  actionState.loading = true
  actionState.error = ''
  const previousRows = [...resource.rows.value]
  let usedOptimisticUpdate = false

  try {
    const path = resolvePathPlaceholders(action.pathTemplate, actionState.selectedRow)
    const payload = action.payload(actionState.selectedRow, actionState.formValues)

    const payloadSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    if (Object.keys(payload).length > 0) {
      payloadSchema.parse(payload)
    }

    usedOptimisticUpdate = applyOptimisticUpdate(
      action.key,
      action.method,
      actionState.selectedRow,
      payload,
    )

    await api.request(path, {
      method: action.method,
      body: Object.keys(payload).length > 0 ? payload : undefined,
      requiresAuth: props.config.requiresAuth ?? true,
    })

    // Always reconcile with the server after a successful mutation so the table
    // stays current on its own — this replaces the manual "Refresh" button. The
    // optimistic update above keeps the row change visible while the refetch is
    // in flight, then the fresh page reflects authoritative server state.
    await resource.fetchPage(resource.page.value)

    toasts.pushSuccess(resolveSuccessMessage(action, actionState.selectedRow, actionState.formValues))
    closeActionDialog()
  } catch (error) {
    if (usedOptimisticUpdate) {
      resource.rows.value = previousRows
    }

    const baseErrorMessage = extractErrorMessage(error)
    const errorMessage = resolveErrorMessage(
      action,
      actionState.selectedRow,
      actionState.formValues,
      error,
      baseErrorMessage,
    )
    actionState.error = errorMessage
    toasts.pushError(errorMessage)
  } finally {
    actionState.loading = false
  }
}

const submitActionForm = async (values: Record<string, string | number>) => {
  actionState.formValues = values

  const requiredFields = selectedActionFormFields.value.filter(
    (field) => field.required || (typeof field.requiredWhen === 'function' && field.requiredWhen(values)),
  )
  const hasMissing = requiredFields.some((field) => {
    const value = values[field.key]
    return value === '' || value === undefined || value === null
  })

  if (hasMissing) {
    actionState.error = t('action_error_required_fields')
    return
  }

  actionState.confirmOpen = true
  actionState.formOpen = false
}

watch(
  () => props.config.endpoint,
  async () => {
    await resource.fetchPage(1)
  },
  {
    immediate: true,
  },
)

// Background auto-refresh: for resources that opt in (config.refreshIntervalMs),
// silently re-fetch the current page on an interval so member-driven changes
// (new or cancelled bookings, incoming notifications) appear without a manual
// reload. Paused while a dialog/action is in flight (to preserve optimistic
// state) and while the tab is hidden (to avoid needless requests).
let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  // Inbox-style "mark all read on open": flag the unread items read on the
  // server, then reconcile the list rows and the global unread badge so the
  // page and sidebar reflect the cleared state immediately.
  if (props.config.markReadOnVisitPath) {
    try {
      await api.request(props.config.markReadOnVisitPath, {
        method: 'PUT',
        requiresAuth: props.config.requiresAuth ?? true,
      })
      await resource.fetchPage(resource.page.value, true)
      await useNotificationsFeed().poll()
    } catch {
      // Best-effort; the next auto-refresh / poll reconciles if this failed.
    }
  }

  const interval = props.config.refreshIntervalMs
  if (!interval || interval <= 0) {
    return
  }

  pollTimer = setInterval(() => {
    if (actionState.loading || actionState.confirmOpen || actionState.formOpen) {
      return
    }
    if (typeof document !== 'undefined' && document.hidden) {
      return
    }
    void resource.fetchPage(resource.page.value, true)
  }, interval)
})

onBeforeUnmount(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})

watch(
  () => locale.value,
  () => {
    // Re-resolve dialog strings when locale switches so open dialogs update live.
    const action = findAction(actionState.selectedActionKey)

    if (action) {
      const resolvedLabel: string = action.labelKey
        ? resolveUiMessage(action.labelKey, locale.value)
        : (action.label || '')
      actionState.title = resolvedLabel
      actionState.message = action.confirmMessageKey
        ? resolveUiMessage(action.confirmMessageKey, locale.value)
        : (action.confirmMessage || `Confirm action: ${resolvedLabel}?`)
      actionState.confirmLabel = resolvedLabel
    }
  },
)
</script>
