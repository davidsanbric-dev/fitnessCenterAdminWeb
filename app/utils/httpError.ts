/**
 * Pull the HTTP status off an $fetch/ofetch error regardless of which shape the
 * runtime surfaced (`status`, `statusCode`, or nested `response.status`).
 */
export const extractStatus = (error: unknown): number | undefined => {
  const err = error as { status?: number; statusCode?: number; response?: { status?: number } }
  return err?.status ?? err?.statusCode ?? err?.response?.status
}

/**
 * Pull the backend's `detail` string off an $fetch/ofetch error. The body lives
 * under `data` for parsed JSON errors and under `response._data` otherwise.
 */
export const extractDetail = (error: unknown): string | undefined => {
  const err = error as { data?: { detail?: string }; response?: { _data?: { detail?: string } } }
  return err?.data?.detail ?? err?.response?._data?.detail
}
