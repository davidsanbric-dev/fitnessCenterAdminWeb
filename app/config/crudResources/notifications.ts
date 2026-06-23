import type { CrudResourceConfig } from './types'

export const notifications: CrudResourceConfig = {
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
}
