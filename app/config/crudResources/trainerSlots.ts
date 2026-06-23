import type { CrudResourceConfig } from './types'

// Trainer-scoped: the signed-in trainer manages its own slots. Mutations here
// trigger a push notification to the company's members (handled server-side).
export const trainerSlots: CrudResourceConfig = {
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
}
