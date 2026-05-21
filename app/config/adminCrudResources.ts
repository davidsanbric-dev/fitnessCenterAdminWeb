export interface CrudColumn {
  key: string
  label: string
  labelKey?: string
  type?: 'text' | 'date' | 'datetime' | 'boolean'
}

export interface CrudResourceConfig {
  title: string
  titleKey?: string
  description: string
  descriptionKey?: string
  endpoint: string
  requiresAuth?: boolean
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
      type: 'text' | 'textarea' | 'select' | 'number'
      required?: boolean
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
      type: 'text' | 'textarea' | 'select' | 'number'
      required?: boolean
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
            defaultValue: 'Updated by admin panel',
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
      { key: 'booking_id', label: 'ID', labelKey: 'col_id' },
      { key: 'booking_status', label: 'Status', labelKey: 'col_booking_status' },
      { key: 'booking_datetime', label: 'Datetime', type: 'datetime', labelKey: 'col_booking_datetime' },
      { key: 'trainer.full_name', label: 'Trainer', labelKey: 'col_trainer' },
      { key: 'class_type.name', label: 'Class Type', labelKey: 'col_class_type' },
      { key: 'location.name', label: 'Location', labelKey: 'col_location' },
      { key: 'is_online', label: 'Online', type: 'boolean', labelKey: 'col_online' },
    ],
  },
  trainers: {
    title: 'Trainers',
    titleKey: 'resource_trainers_title',
    description: 'Reusable CRUD table powered by trainer catalog endpoint.',
    descriptionKey: 'resource_trainers_description',
    endpoint: '/trainers',
    requiresAuth: false,
    filters: [
      {
        key: 'search',
        label: 'Search',
        labelKey: 'filter_search',
        type: 'text',
      },
    ],
    columns: [
      { key: 'trainer_id', label: 'ID', labelKey: 'col_id' },
      { key: 'full_name', label: 'Name', labelKey: 'col_name' },
      { key: 'discipline_name', label: 'Discipline', labelKey: 'col_discipline' },
      { key: 'bio', label: 'Bio', labelKey: 'col_bio' },
    ],
  },
  disciplines: {
    title: 'Disciplines',
    titleKey: 'resource_disciplines_title',
    description: 'Shared table template configured for discipline management.',
    descriptionKey: 'resource_disciplines_description',
    endpoint: '/disciplines',
    requiresAuth: false,
    filters: [
      {
        key: 'search',
        label: 'Search',
        labelKey: 'filter_search',
        type: 'text',
      },
    ],
    columns: [
      { key: 'discipline_id', label: 'ID', labelKey: 'col_id' },
      { key: 'discipline_code', label: 'Code', labelKey: 'col_code' },
      { key: 'name', label: 'Name', labelKey: 'col_name' },
      { key: 'description', label: 'Description', labelKey: 'col_description' },
      { key: 'trainers_count', label: 'Trainers', labelKey: 'col_trainers_count' },
    ],
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
          key: 'includes_personal_training',
          label: 'Includes Personal Training',
          labelKey: 'field_includes_personal_training',
          type: 'select',
          required: true,
          defaultValue: 'false',
          options: [
            { label: 'No', labelKey: 'field_option_no', value: 'false' },
            { label: 'Yes', labelKey: 'field_option_yes', value: 'true' },
          ],
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
        includes_personal_training: String(values.includes_personal_training || 'false') === 'true',
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
            key: 'includes_personal_training',
            label: 'Includes Personal Training',
            labelKey: 'field_includes_personal_training',
            type: 'select',
            required: true,
            options: [
              { label: 'No', labelKey: 'field_option_no', value: 'false' },
              { label: 'Yes', labelKey: 'field_option_yes', value: 'true' },
            ],
            fromRowPath: 'includes_personal_training',
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
          includes_personal_training: String(values.includes_personal_training || row.includes_personal_training || 'false') === 'true',
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
      { key: 'membership_plan_id', label: 'ID', labelKey: 'col_id' },
      { key: 'name', label: 'Name', labelKey: 'col_name' },
      { key: 'price', label: 'Price', labelKey: 'col_price' },
      { key: 'duration_days', label: 'Duration (days)', labelKey: 'col_duration_days' },
      { key: 'max_bookings_per_month', label: 'Max Bookings', labelKey: 'col_max_bookings' },
    ],
  },
  notifications: {
    title: 'Notifications',
    titleKey: 'resource_notifications_title',
    description: 'Current admin notifications using shared table template.',
    descriptionKey: 'resource_notifications_description',
    endpoint: '/notifications',
    requiresAuth: true,
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
      { key: 'id', label: 'ID', labelKey: 'col_id' },
      { key: 'title', label: 'Title', labelKey: 'col_title' },
      { key: 'type', label: 'Type', labelKey: 'col_type' },
      { key: 'is_read', label: 'Read', type: 'boolean', labelKey: 'col_read' },
      { key: 'created_at', label: 'Created At', type: 'datetime', labelKey: 'col_created_at' },
    ],
  },
}
