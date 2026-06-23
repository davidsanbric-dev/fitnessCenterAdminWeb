import type { CrudResourceConfig } from './types'

export const bookings: CrudResourceConfig = {
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
        ],
      },
    ],
  },
}
