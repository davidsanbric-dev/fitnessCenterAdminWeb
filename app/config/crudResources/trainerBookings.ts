import type { CrudResourceConfig } from './types'

// Trainer-scoped read-only bookings for the signed-in trainer's own sessions.
export const trainerBookings: CrudResourceConfig = {
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
        notes: String(values.notes || ''),
      }),
    },
  ],
  columns: [
    { key: 'booking_status', label: 'Status', type: 'status', labelKey: 'col_booking_status' },
    { key: 'booking_datetime', label: 'Datetime', type: 'datetime', labelKey: 'col_booking_datetime' },
    { key: 'member.full_name', label: 'Member', labelKey: 'col_member' },
    { key: 'class_type.name', label: 'Class Type', labelKey: 'col_class_type' },
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
        ],
      },
    ],
  },
}
