import type { CrudResourceConfig } from './types'

export const disciplines: CrudResourceConfig = {
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
}
