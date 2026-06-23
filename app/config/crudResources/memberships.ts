import type { CrudResourceConfig } from './types'

export const memberships: CrudResourceConfig = {
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
}
