export interface CrudColumn {
  key: string
  label: string
  labelKey?: string
  type?: 'text' | 'date' | 'datetime' | 'boolean' | 'status' | 'image'
}

/** A single field surfaced inside a mobile "view details" dialog. */
export interface MobileDetailField {
  key: string
  label: string
  labelKey?: string
  type?: CrudColumn['type']
}

/** A more-actions menu entry that opens a read-only details dialog. */
export interface MobileDetailView {
  key: string
  label: string
  labelKey?: string
  fields: MobileDetailField[]
}

/**
 * Drives the responsive mobile card layout: which compound row cell renders the
 * primary content, plus any secondary fields collapsed behind the "..." menu's
 * read-only detail dialogs. Row actions defined on the resource are appended to
 * the same menu automatically.
 */
export interface MobileCellConfig {
  variant: 'booking' | 'trainer' | 'discipline' | 'plan' | 'slot'
  detailViews?: MobileDetailView[]
}

/** A single input rendered inside an action's confirm/create form dialog. */
export interface CrudActionField {
  key: string
  label: string
  labelKey?: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'datetime'
  required?: boolean
  requiredWhen?: (values: Record<string, string | number>) => boolean
  placeholder?: string
  placeholderKey?: string
  options?: Array<{ label: string; value: string; labelKey?: string }>
  defaultValue?: string | number
  fromRowPath?: string
}

/**
 * A create or per-row action: the HTTP call it issues, the dialog copy around
 * it, and the optional form it collects before confirming. `createAction` and
 * each `rowActions` entry share this exact shape.
 */
export interface CrudAction {
  key: string
  label: string
  labelKey?: string
  method: 'PATCH' | 'POST' | 'PUT' | 'DELETE'
  pathTemplate: string
  confirmMessage?: string
  confirmMessageKey?: string
  successMessageKey?: string
  successMessage?: string | ((row: Record<string, unknown>, values: Record<string, string | number>) => string)
  errorMessageKey?: string
  errorMessage?: string | ((row: Record<string, unknown>, values: Record<string, string | number>, error: unknown) => string)
  formFields?: CrudActionField[]
  payload: (
    row: Record<string, unknown>,
    values: Record<string, string | number>,
  ) => Record<string, unknown>
}

export interface CrudResourceConfig {
  title: string
  titleKey?: string
  description: string
  descriptionKey?: string
  endpoint: string
  requiresAuth?: boolean
  // When set, the list view silently re-fetches the current page on this
  // interval (ms) so member-driven changes (new/cancelled bookings) surface
  // without a manual reload. Omitted on largely-static catalogue resources.
  refreshIntervalMs?: number
  // When set, visiting the page issues a PUT to this path once (inbox-style
  // "mark all read on open"), then refreshes the list and the unread badge.
  markReadOnVisitPath?: string
  filters?: Array<{
    key: string
    label: string
    labelKey?: string
    type: 'text' | 'select'
    options?: Array<{ label: string; value: string; labelKey?: string }>
  }>
  createAction?: CrudAction
  rowActions?: CrudAction[]
  columns: CrudColumn[]
  // Optional responsive layout: when set, narrow viewports render compound row
  // cells + a more-actions menu instead of the horizontally-scrolling table.
  mobile?: MobileCellConfig
}

/** Unambiguous type guard for filter type narrowing when labelKey and type share the same string literals. */
export const isTextFilter = (filter: { type?: string; labelKey?: string; label?: string; options?: ReadonlyArray<{ value: string }> } | null | undefined): filter is { type: 'text' } =>
  !!filter && filter.type === 'text'
