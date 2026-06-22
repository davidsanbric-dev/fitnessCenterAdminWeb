import { ref } from 'vue'

import { useApiClient } from './useApiClient'

interface CrudResult {
  items?: Array<Record<string, unknown>>
  total?: number
  page?: number
  page_size?: number
}

export const useCrudResource = (
  endpoint: string,
  options: {
    requiresAuth?: boolean
    initialQuery?: Record<string, string | number | boolean | undefined>
  } = {},
) => {
  const api = useApiClient()

  const rows = ref<Array<Record<string, unknown>>>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const query = ref<Record<string, string | number | boolean | undefined>>({
    ...(options.initialQuery || {}),
  })

  const updateQuery = (key: string, value: string | number | boolean | undefined) => {
    if (value === '' || value === undefined || value === null) {
      delete query.value[key]
      return
    }

    query.value[key] = value
  }

  const fetchPage = async (targetPage = page.value, silent = false) => {
    // `silent` skips the loading flag so background polling refreshes the table
    // in place without flashing the spinner or empty state.
    if (!silent) {
      loading.value = true
    }

    try {
      const response = await api.get<CrudResult>(
        endpoint,
        {
          page: targetPage,
          page_size: pageSize.value,
          ...query.value,
        },
        options.requiresAuth ?? true,
      )

      if (Array.isArray(response.items)) {
        rows.value = response.items
        total.value = response.total || response.items.length
        page.value = response.page || targetPage
      } else if (Array.isArray(response as unknown as Array<Record<string, unknown>>)) {
        const fallbackArray = response as unknown as Array<Record<string, unknown>>
        rows.value = fallbackArray
        total.value = fallbackArray.length
        page.value = 1
      }
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  return {
    rows,
    loading,
    total,
    page,
    pageSize,
    query,
    updateQuery,
    fetchPage,
  }
}
