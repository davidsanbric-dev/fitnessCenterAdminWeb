export interface CrudColumn {
  key: string
  label: string
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
    type: 'text' | 'select'
    options?: Array<{ label: string; value: string }>
  }>
  createAction?: {
    key: string
    label: string
    method: 'PATCH' | 'POST' | 'PUT' | 'DELETE'
    pathTemplate: string
    confirmMessage?: string
    successMessageKey?: string
    successMessage?: string | ((row: Record<string, unknown>, values: Record<string, string | number>) => string)
    errorMessageKey?: string
    errorMessage?: string | ((row: Record<string, unknown>, values: Record<string, string | number>, error: unknown) => string)
    formFields?: Array<{
      key: string
      label: string
      type: 'text' | 'textarea' | 'select' | 'number'
      required?: boolean
      placeholder?: string
      options?: Array<{ label: string; value: string }>
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
    method: 'PATCH' | 'POST' | 'PUT' | 'DELETE'
    pathTemplate: string
    confirmMessage?: string
    successMessageKey?: string
    successMessage?: string | ((row: Record<string, unknown>, values: Record<string, string | number>) => string)
    errorMessageKey?: string
    errorMessage?: string | ((row: Record<string, unknown>, values: Record<string, string | number>, error: unknown) => string)
    formFields?: Array<{
      key: string
      label: string
      type: 'text' | 'textarea' | 'select' | 'number'
      required?: boolean
      placeholder?: string
      options?: Array<{ label: string; value: string }>
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
        type: 'select',
        options: [
          { label: 'All', value: '' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Confirmed', value: 'CONFIRMED' },
          { label: 'Cancelled', value: 'CANCELLED' },
          { label: 'Completed', value: 'COMPLETED' },
        ],
      },
    ],
    rowActions: [
      {
        key: 'update_status',
        label: 'Update Status',
        method: 'PATCH',
        pathTemplate: '/admin/bookings/{booking_id}/status',
        confirmMessage: 'Apply booking status update?',
        successMessageKey: 'booking_update_status_success',
        errorMessageKey: 'booking_update_status_error',
        formFields: [
          {
            key: 'booking_status',
            label: 'Booking Status',
            type: 'select',
            required: true,
            defaultValue: 'CONFIRMED',
            options: [
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Cancelled', value: 'CANCELLED' },
              { label: 'Completed', value: 'COMPLETED' },
            ],
          },
          {
            key: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Optional admin note',
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
      { key: 'booking_id', label: 'ID' },
      { key: 'booking_status', label: 'Status' },
      { key: 'booking_datetime', label: 'Datetime', type: 'datetime' },
      { key: 'trainer.full_name', label: 'Trainer' },
      { key: 'class_type.name', label: 'Class Type' },
      { key: 'location.name', label: 'Location' },
      { key: 'is_online', label: 'Online', type: 'boolean' },
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
        type: 'text',
      },
    ],
    columns: [
      { key: 'trainer_id', label: 'ID' },
      { key: 'full_name', label: 'Name' },
      { key: 'discipline_name', label: 'Discipline' },
      { key: 'bio', label: 'Bio' },
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
        type: 'text',
      },
    ],
    columns: [
      { key: 'discipline_id', label: 'ID' },
      { key: 'discipline_code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'trainers_count', label: 'Trainers' },
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
      method: 'POST',
      pathTemplate: '/admin/membership-plans',
      confirmMessage: 'Create this membership plan?',
      successMessageKey: 'membership_create_success',
      errorMessageKey: 'membership_create_error',
      formFields: [
        { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Premium Plus' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Plan details' },
        { key: 'price', label: 'Price', type: 'number', required: true, defaultValue: 0 },
        { key: 'duration_days', label: 'Duration Days', type: 'number', required: true, defaultValue: 30 },
        {
          key: 'max_bookings_per_month',
          label: 'Max Bookings/Month',
          type: 'number',
          required: true,
          defaultValue: 20,
        },
        {
          key: 'includes_personal_training',
          label: 'Includes Personal Training',
          type: 'select',
          required: true,
          defaultValue: 'false',
          options: [
            { label: 'No', value: 'false' },
            { label: 'Yes', value: 'true' },
          ],
        },
        {
          key: 'features_csv',
          label: 'Features (comma separated)',
          type: 'textarea',
          placeholder: 'Unlimited classes, Sauna access',
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
        method: 'PUT',
        pathTemplate: '/admin/membership-plans/{membership_plan_id}',
        confirmMessage: 'Apply membership plan changes?',
        successMessageKey: 'membership_edit_success',
        errorMessageKey: 'membership_edit_error',
        formFields: [
          { key: 'name', label: 'Name', type: 'text', required: true, fromRowPath: 'name' },
          { key: 'description', label: 'Description', type: 'textarea', fromRowPath: 'description' },
          { key: 'price', label: 'Price', type: 'number', required: true, fromRowPath: 'price' },
          {
            key: 'duration_days',
            label: 'Duration Days',
            type: 'number',
            required: true,
            fromRowPath: 'duration_days',
          },
          {
            key: 'max_bookings_per_month',
            label: 'Max Bookings/Month',
            type: 'number',
            required: true,
            fromRowPath: 'max_bookings_per_month',
          },
          {
            key: 'includes_personal_training',
            label: 'Includes Personal Training',
            type: 'select',
            required: true,
            options: [
              { label: 'No', value: 'false' },
              { label: 'Yes', value: 'true' },
            ],
            fromRowPath: 'includes_personal_training',
          },
          {
            key: 'features_csv',
            label: 'Features (comma separated)',
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
          method: 'DELETE',
          pathTemplate: '/admin/membership-plans/{membership_plan_id}',
          confirmMessage: 'Delete this membership plan? This cannot be undone.',
          successMessageKey: 'membership_delete_success',
          errorMessageKey: 'membership_delete_error',
          payload: () => ({}),
        },
    ],
    columns: [
      { key: 'membership_plan_id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'price', label: 'Price' },
      { key: 'duration_days', label: 'Duration (days)' },
      { key: 'max_bookings_per_month', label: 'Max Bookings' },
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
        type: 'select',
        options: [
          { label: 'All', value: '' },
          { label: 'Read', value: 'true' },
          { label: 'Unread', value: 'false' },
        ],
      },
    ],
    rowActions: [
      {
        key: 'mark_read',
        label: 'Mark Read',
        method: 'PUT',
        pathTemplate: '/notifications/{id}/read',
        confirmMessage: 'Mark this notification as read?',
        successMessageKey: 'notification_mark_read_success',
        errorMessageKey: 'notification_mark_read_error',
        payload: () => ({}),
      },
    ],
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'is_read', label: 'Read', type: 'boolean' },
      { key: 'created_at', label: 'Created At', type: 'datetime' },
    ],
  },
}
