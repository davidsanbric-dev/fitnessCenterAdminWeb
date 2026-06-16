export interface CrudColumn {
  key: string
  label: string
  labelKey?: string
  type?: 'text' | 'date' | 'datetime' | 'boolean' | 'status'
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
  createAction?: {
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
    formFields?: Array<{
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
    }>
    payload: (
      row: Record<string, unknown>,
      values: Record<string, string | number>,
    ) => Record<string, unknown>
  }
  rowActions?: Array<{
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
    formFields?: Array<{
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
    }>
    payload: (
      row: Record<string, unknown>,
      values: Record<string, string | number>,
    ) => Record<string, unknown>
  }>
  columns: CrudColumn[]
  // Optional responsive layout: when set, narrow viewports render compound row
  // cells + a more-actions menu instead of the horizontally-scrolling table.
  mobile?: MobileCellConfig
}

/** Unambiguous type guard for filter type narrowing when labelKey and type share the same string literals. */
export const isTextFilter = (filter: { type?: string; labelKey?: string; label?: string; options?: ReadonlyArray<{ value: string }> } | null | undefined): filter is { type: 'text' } =>
  !!filter && filter.type === 'text'

export const adminCrudResources: Record<string, CrudResourceConfig> = {
  bookings: {
    title: 'Bookings',
    titleKey: 'resource_bookings_title',
    description: 'Shared CRUD template over admin bookings endpoint.',
    descriptionKey: 'resource_bookings_description',
    endpoint: '/admin/bookings',
    requiresAuth: true,
    refreshIntervalMs: 20000,
    filters: [
      {
        key: 'booking_status',
        label: 'Status',
        labelKey: 'filter_booking_status',
        type: 'select',
        options: [
          { label: 'All', labelKey: 'filter_option_all', value: '' },
          { label: 'Pending', labelKey: 'filter_option_pending', value: 'PENDING' },
          { label: 'Confirmed', labelKey: 'filter_option_confirmed', value: 'CONFIRMED' },
          { label: 'Cancelled', labelKey: 'filter_option_cancelled', value: 'CANCELLED' },
          { label: 'Completed', labelKey: 'filter_option_completed', value: 'COMPLETED' },
        ],
      },
    ],
    rowActions: [
      {
        key: 'update_status',
        label: 'Update Status',
        labelKey: 'action_update_status',
        method: 'PATCH',
        pathTemplate: '/admin/bookings/{booking_id}/status',
        confirmMessageKey: 'action_confirm_update_status',
        successMessageKey: 'booking_update_status_success',
        errorMessageKey: 'booking_update_status_error',
        formFields: [
          {
            key: 'booking_status',
            label: 'Booking Status',
            labelKey: 'field_booking_status',
            type: 'select',
            required: true,
            defaultValue: 'CONFIRMED',
            options: [
              { label: 'Confirmed', labelKey: 'field_booking_status_option_confirmed', value: 'CONFIRMED' },
              { label: 'Cancelled', labelKey: 'field_booking_status_option_cancelled', value: 'CANCELLED' },
              { label: 'Completed', labelKey: 'field_booking_status_option_completed', value: 'COMPLETED' },
            ],
          },
          {
            key: 'notes',
            label: 'Notes',
            labelKey: 'field_notes',
            type: 'textarea',
            placeholderKey: 'field_notes_placeholder',
            // Mandatory when completing a session: the note is the member's
            // post-session feedback, surfaced in their mobile Training History.
            requiredWhen: (values) => String(values.booking_status || '') === 'COMPLETED',
          },
        ],
        payload: (row, values) => ({
          booking_status: String(values.booking_status || 'CONFIRMED'),
          location_code: String(
            (row.location as Record<string, unknown> | undefined)?.location_code || '',
          ),
          notes: String(values.notes || ''),
        }),
      },
    ],
    columns: [
      { key: 'booking_status', label: 'Status', type: 'status', labelKey: 'col_booking_status' },
      { key: 'booking_datetime', label: 'Datetime', type: 'datetime', labelKey: 'col_booking_datetime' },
      { key: 'member.full_name', label: 'Member', labelKey: 'col_member' },
      { key: 'trainer.full_name', label: 'Trainer', labelKey: 'col_trainer' },
      { key: 'class_type.name', label: 'Class Type', labelKey: 'col_class_type' },
      { key: 'location.name', label: 'Location', labelKey: 'col_location' },
    ],
    mobile: {
      variant: 'booking',
      detailViews: [
        {
          key: 'details',
          label: 'View Details',
          labelKey: 'mobile_view_details',
          fields: [
            { key: 'class_type.name', label: 'Class Type', labelKey: 'col_class_type' },
            { key: 'location.name', label: 'Location', labelKey: 'col_location' },
          ],
        },
      ],
    },
  },
  trainers: {
    title: 'Trainers',
    titleKey: 'resource_trainers_title',
    description: 'Reusable CRUD table powered by trainer catalog endpoint.',
    descriptionKey: 'resource_trainers_description',
    endpoint: '/trainers',
    // Per-company data isolation: the trainer catalog is no longer public and
    // returns 401 without a Firebase ID token. The backend scopes results to the
    // authenticated user's company. See data_environment_isolation specs §3.1/§5.
    requiresAuth: true,
    // Staff-only trainer provisioning. Posts credentials + personal data to the
    // admin endpoint, which creates the Firebase account (email-verified), the
    // user (trainer role) and the linked trainer record in the admin's company.
    createAction: {
      key: 'create_trainer',
      label: 'Add Trainer',
      method: 'POST',
      pathTemplate: '/admin/trainers',
      confirmMessage: 'Create this trainer account?',
      successMessage: 'Trainer created — they can now sign in to the web app.',
      errorMessage: 'Could not create trainer: {error_message}',
      formFields: [
        { key: 'full_name', label: 'Full name', type: 'text', required: true, placeholder: 'e.g. Jordan Pike' },
        { key: 'email', label: 'Email', type: 'text', required: true, placeholder: 'trainer@company.com' },
        { key: 'password', label: 'Temporary password', type: 'text', required: true, placeholder: 'min. 6 characters' },
        { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Short professional bio' },
        {
          key: 'certifications',
          label: 'Certifications (comma separated)',
          type: 'textarea',
          placeholder: 'NASM-CPT, Strength & Conditioning',
        },
      ],
      payload: (_, values) => ({
        full_name: String(values.full_name || '').trim(),
        email: String(values.email || '').trim().toLowerCase(),
        password: String(values.password || ''),
        bio: String(values.bio || '').trim() || null,
        // Sent as a CSV string (the generic CRUD client only emits scalar fields);
        // the backend splits it into a list. See TrainerAdminCreateRequest.
        certifications: String(values.certifications || '').trim(),
      }),
    },
    filters: [
      {
        key: 'search',
        label: 'Search',
        labelKey: 'filter_search',
        type: 'text',
      },
    ],
    columns: [
      { key: 'full_name', label: 'Name', labelKey: 'col_name' },
      { key: 'discipline_name', label: 'Discipline', labelKey: 'col_discipline' },
      { key: 'bio', label: 'Bio', labelKey: 'col_bio' },
    ],
    mobile: {
      variant: 'trainer',
      detailViews: [
        {
          key: 'bio',
          label: 'View Bio',
          labelKey: 'mobile_view_bio',
          fields: [
            { key: 'bio', label: 'Bio', labelKey: 'col_bio' },
          ],
        },
      ],
    },
  },
  disciplines: {
    title: 'Disciplines',
    titleKey: 'resource_disciplines_title',
    description: 'Shared table template configured for discipline management.',
    descriptionKey: 'resource_disciplines_description',
    endpoint: '/disciplines',
    // Per-company data isolation: the discipline catalog is no longer public and
    // returns 401 without a Firebase ID token. The backend scopes results to the
    // authenticated user's company. See data_environment_isolation specs §3.1/§5.
    requiresAuth: true,
    filters: [
      {
        key: 'search',
        label: 'Search',
        labelKey: 'filter_search',
        type: 'text',
      },
    ],
    columns: [
      { key: 'discipline_code', label: 'Code', labelKey: 'col_code' },
      { key: 'name', label: 'Name', labelKey: 'col_name' },
      { key: 'description', label: 'Description', labelKey: 'col_description' },
      { key: 'trainers_count', label: 'Trainers', labelKey: 'col_trainers_count' },
    ],
    // The name-description-trainers compound cell surfaces every field, so the
    // mobile card needs no more-actions menu (the resource has no row actions).
    mobile: { variant: 'discipline' },
  },
  memberships: {
    title: 'Membership Plans',
    titleKey: 'resource_memberships_title',
    description: 'Reusable CRUD scaffold configured for memberships catalog.',
    descriptionKey: 'resource_memberships_description',
    endpoint: '/membership-plans',
    requiresAuth: true,
    createAction: {
      key: 'create_membership_plan',
      label: 'Create Plan',
      labelKey: 'action_create_plan',
      method: 'POST',
      pathTemplate: '/admin/membership-plans',
      confirmMessageKey: 'action_confirm_create_membership',
      successMessageKey: 'membership_create_success',
      errorMessageKey: 'membership_create_error',
      formFields: [
        { key: 'name', label: 'Name', labelKey: 'field_name', type: 'text', required: true, placeholderKey: 'field_name_placeholder_membership' },
        { key: 'description', label: 'Description', labelKey: 'field_description', type: 'textarea', placeholderKey: 'field_description_placeholder_membership' },
        { key: 'price', label: 'Price', labelKey: 'field_price', type: 'number', required: true, defaultValue: 0 },
        { key: 'duration_days', label: 'Duration Days', labelKey: 'field_duration_days', type: 'number', required: true, defaultValue: 30 },
        {
          key: 'max_bookings_per_month',
          label: 'Max Bookings/Month',
          labelKey: 'field_max_bookings_per_month',
          type: 'number',
          required: true,
          defaultValue: 20,
        },
        {
          key: 'features_csv',
          label: 'Features (comma separated)',
          labelKey: 'field_features_csv',
          type: 'textarea',
          placeholderKey: 'field_features_csv_placeholder',
        },
      ],
      payload: (_, values) => ({
        name: String(values.name || '').trim(),
        description: String(values.description || '').trim() || null,
        price: Number(values.price || 0),
        duration_days: Number(values.duration_days || 30),
        max_bookings_per_month: Number(values.max_bookings_per_month || 0),
        features: String(values.features_csv || '')
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      }),
    },
    rowActions: [
      {
        key: 'edit_membership_plan',
        label: 'Edit Plan',
        labelKey: 'action_edit_plan',
        method: 'PUT',
        pathTemplate: '/admin/membership-plans/{membership_plan_id}',
        confirmMessageKey: 'action_confirm_edit_membership',
        successMessageKey: 'membership_edit_success',
        errorMessageKey: 'membership_edit_error',
        formFields: [
          { key: 'name', label: 'Name', labelKey: 'field_name', type: 'text', required: true, fromRowPath: 'name' },
          { key: 'description', label: 'Description', labelKey: 'field_description', type: 'textarea', fromRowPath: 'description' },
          { key: 'price', label: 'Price', labelKey: 'field_price', type: 'number', required: true, fromRowPath: 'price' },
          {
            key: 'duration_days',
            label: 'Duration Days',
            labelKey: 'field_duration_days',
            type: 'number',
            required: true,
            fromRowPath: 'duration_days',
          },
          {
            key: 'max_bookings_per_month',
            label: 'Max Bookings/Month',
            labelKey: 'field_max_bookings_per_month',
            type: 'number',
            required: true,
            fromRowPath: 'max_bookings_per_month',
          },
          {
            key: 'features_csv',
            label: 'Features (comma separated)',
            labelKey: 'field_features_csv',
            type: 'textarea',
            fromRowPath: 'features',
          },
        ],
        payload: (row, values) => ({
          name: String(values.name || row.name || '').trim(),
          description: String(values.description || '').trim() || null,
          price: Number(values.price || row.price || 0),
          duration_days: Number(values.duration_days || row.duration_days || 30),
          max_bookings_per_month: Number(values.max_bookings_per_month || row.max_bookings_per_month || 0),
          features: String(values.features_csv || '')
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0),
        }),
      },
        {
          key: 'delete_membership_plan',
          label: 'Delete Plan',
          labelKey: 'action_delete_plan',
          method: 'DELETE',
          pathTemplate: '/admin/membership-plans/{membership_plan_id}',
          confirmMessageKey: 'action_confirm_delete_membership',
          successMessageKey: 'membership_delete_success',
          errorMessageKey: 'membership_delete_error',
          payload: () => ({}),
        },
    ],
    columns: [
      { key: 'name', label: 'Name', labelKey: 'col_name' },
      { key: 'price', label: 'Price', labelKey: 'col_price' },
      { key: 'duration_days', label: 'Duration (days)', labelKey: 'col_duration_days' },
      { key: 'max_bookings_per_month', label: 'Max Bookings', labelKey: 'col_max_bookings' },
    ],
    mobile: {
      variant: 'plan',
      detailViews: [
        {
          key: 'details',
          label: 'View Details',
          labelKey: 'mobile_view_details',
          fields: [
            { key: 'description', label: 'Description', labelKey: 'col_description' },
            { key: 'features', label: 'Features', labelKey: 'col_features' },
          ],
        },
      ],
    },
  },
  notifications: {
    title: 'Notifications',
    titleKey: 'resource_notifications_title',
    description: 'Current admin notifications using shared table template.',
    descriptionKey: 'resource_notifications_description',
    endpoint: '/notifications',
    requiresAuth: true,
    refreshIntervalMs: 20000,
    markReadOnVisitPath: '/notifications/read-all',
    filters: [
      {
        key: 'is_read',
        label: 'Read Status',
        labelKey: 'filter_read_status',
        type: 'select',
        options: [
          { label: 'All', labelKey: 'filter_option_all', value: '' },
          { label: 'Read', labelKey: 'filter_option_read', value: 'true' },
          { label: 'Unread', labelKey: 'filter_option_unread', value: 'false' },
        ],
      },
    ],
    rowActions: [
      {
        key: 'mark_read',
        label: 'Mark Read',
        labelKey: 'action_mark_read',
        method: 'PUT',
        pathTemplate: '/notifications/{id}/read',
        confirmMessageKey: 'action_confirm_mark_read',
        successMessageKey: 'notification_mark_read_success',
        errorMessageKey: 'notification_mark_read_error',
        payload: () => ({}),
      },
    ],
    columns: [
      { key: 'title', label: 'Title', labelKey: 'col_title' },
      { key: 'type', label: 'Type', labelKey: 'col_type' },
      { key: 'is_read', label: 'Read', type: 'boolean', labelKey: 'col_read' },
      { key: 'created_at', label: 'Created At', type: 'datetime', labelKey: 'col_created_at' },
    ],
  },
  // Trainer-scoped: the signed-in trainer manages its own slots. Mutations here
  // trigger a push notification to the company's members (handled server-side).
  trainerSlots: {
    title: 'My Slots',
    description: 'Manage your availability. Changes notify members.',
    endpoint: '/trainers/me/slots',
    requiresAuth: true,
    createAction: {
      key: 'create_slot',
      label: 'Add Slot',
      method: 'POST',
      pathTemplate: '/trainers/me/slots',
      confirmMessage: 'Create this slot?',
      successMessage: 'Slot created — members notified.',
      errorMessage: 'Could not create slot.',
      formFields: [
        {
          key: 'slot_datetime',
          label: 'Date & time',
          type: 'datetime',
          required: true,
        },
        { key: 'schedule_type', label: 'Schedule type', type: 'text', defaultValue: 'PERSONAL' },
      ],
      payload: (_, values) => ({
        slot_datetime: String(values.slot_datetime || '').trim(),
        schedule_type: String(values.schedule_type || 'PERSONAL').trim() || 'PERSONAL',
      }),
    },
    rowActions: [
      {
        key: 'toggle_availability',
        label: 'Set Availability',
        method: 'PATCH',
        pathTemplate: '/trainers/me/slots/{slot_id}',
        confirmMessage: 'Update availability?',
        successMessage: 'Slot updated — members notified.',
        errorMessage: 'Could not update slot.',
        formFields: [
          {
            key: 'is_available',
            label: 'Available',
            type: 'select',
            required: true,
            defaultValue: 'true',
            options: [
              { label: 'Available', value: 'true' },
              { label: 'Unavailable', value: 'false' },
            ],
          },
        ],
        payload: (_, values) => ({ is_available: String(values.is_available) === 'true' }),
      },
      {
        key: 'reschedule_slot',
        label: 'Reschedule',
        method: 'PATCH',
        pathTemplate: '/trainers/me/slots/{slot_id}',
        confirmMessage: 'Reschedule this slot?',
        successMessage: 'Slot rescheduled — members notified.',
        errorMessage: 'Could not reschedule slot.',
        formFields: [
          {
            key: 'slot_datetime',
            label: 'New date & time',
            type: 'datetime',
            required: true,
            fromRowPath: 'slot_datetime',
          },
        ],
        payload: (_, values) => ({ slot_datetime: String(values.slot_datetime || '').trim() }),
      },
      {
        key: 'delete_slot',
        label: 'Delete',
        method: 'DELETE',
        pathTemplate: '/trainers/me/slots/{slot_id}',
        confirmMessage: 'Delete this slot? Members will be notified.',
        successMessage: 'Slot deleted — members notified.',
        errorMessage: 'Could not delete slot.',
        payload: () => ({}),
      },
    ],
    columns: [
      { key: 'slot_datetime', label: 'Date & Time', type: 'datetime' },
      { key: 'discipline_name', label: 'Discipline' },
      { key: 'is_available', label: 'Available', type: 'boolean' },
      { key: 'schedule_type', label: 'Type' },
    ],
    // Trainer-role mobile layout: slot digest cell + the availability/reschedule/
    // delete actions collapsed under the more-actions menu.
    mobile: { variant: 'slot' },
  },
  // Trainer-scoped read-only bookings for the signed-in trainer's own sessions.
  trainerBookings: {
    title: 'My Bookings',
    description: 'Bookings for your sessions.',
    endpoint: '/trainers/me/bookings',
    requiresAuth: true,
    refreshIntervalMs: 20000,
    filters: [
      {
        key: 'booking_status',
        label: 'Status',
        labelKey: 'filter_booking_status',
        type: 'select',
        options: [
          { label: 'All', labelKey: 'filter_option_all', value: '' },
          { label: 'Pending', labelKey: 'filter_option_pending', value: 'PENDING' },
          { label: 'Confirmed', labelKey: 'filter_option_confirmed', value: 'CONFIRMED' },
          { label: 'Cancelled', labelKey: 'filter_option_cancelled', value: 'CANCELLED' },
          { label: 'Completed', labelKey: 'filter_option_completed', value: 'COMPLETED' },
        ],
      },
    ],
    rowActions: [
      {
        key: 'update_status',
        label: 'Update Status',
        labelKey: 'action_update_status',
        method: 'PATCH',
        pathTemplate: '/trainers/me/bookings/{booking_id}/status',
        confirmMessageKey: 'action_confirm_update_status',
        successMessageKey: 'booking_update_status_success',
        errorMessageKey: 'booking_update_status_error',
        formFields: [
          {
            key: 'booking_status',
            label: 'Booking Status',
            labelKey: 'field_booking_status',
            type: 'select',
            required: true,
            defaultValue: 'COMPLETED',
            options: [
              { label: 'Confirmed', labelKey: 'field_booking_status_option_confirmed', value: 'CONFIRMED' },
              { label: 'Cancelled', labelKey: 'field_booking_status_option_cancelled', value: 'CANCELLED' },
              { label: 'Completed', labelKey: 'field_booking_status_option_completed', value: 'COMPLETED' },
            ],
          },
          {
            key: 'notes',
            label: 'Notes',
            labelKey: 'field_notes',
            type: 'textarea',
            placeholderKey: 'field_session_feedback_placeholder',
            // Session feedback the member reads in their Training History;
            // required when completing the session.
            requiredWhen: (values) => String(values.booking_status || '') === 'COMPLETED',
          },
        ],
        payload: (row, values) => ({
          booking_status: String(values.booking_status || 'COMPLETED'),
          location_code: String(
            (row.location as Record<string, unknown> | undefined)?.location_code || '',
          ),
          notes: String(values.notes || ''),
        }),
      },
    ],
    columns: [
      { key: 'booking_status', label: 'Status', type: 'status', labelKey: 'col_booking_status' },
      { key: 'booking_datetime', label: 'Datetime', type: 'datetime', labelKey: 'col_booking_datetime' },
      { key: 'member.full_name', label: 'Member', labelKey: 'col_member' },
      { key: 'class_type.name', label: 'Class Type', labelKey: 'col_class_type' },
      { key: 'location.name', label: 'Location', labelKey: 'col_location' },
    ],
    // Mirrors the admin bookings card. The booking compound cell omits the
    // trainer line here (these are the signed-in trainer's own sessions).
    mobile: {
      variant: 'booking',
      detailViews: [
        {
          key: 'details',
          label: 'View Details',
          labelKey: 'mobile_view_details',
          fields: [
            { key: 'class_type.name', label: 'Class Type', labelKey: 'col_class_type' },
            { key: 'location.name', label: 'Location', labelKey: 'col_location' },
          ],
        },
      ],
    },
  },
}
