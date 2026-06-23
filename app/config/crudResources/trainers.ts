import type { CrudResourceConfig } from './types'

export const trainers: CrudResourceConfig = {
  title: 'Trainers',
  titleKey: 'resource_trainers_title',
  description: 'Reusable CRUD table powered by trainer catalog endpoint.',
  descriptionKey: 'resource_trainers_description',
  endpoint: '/trainers',
  // Per-company data isolation: the trainer catalog is no longer public and
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
    { key: 'photo_url', label: 'Image', labelKey: 'col_image', type: 'image' },
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
}
