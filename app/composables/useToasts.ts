export type ToastKind = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  kind: ToastKind
  message: string
}

const AUTO_DISMISS_MS = 3200

export const useToasts = () => {
  const toasts = useState<ToastItem[]>('global-toasts', () => [])

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((item) => item.id !== id)
  }

  const pushToast = (kind: ToastKind, message: string, durationMs = AUTO_DISMISS_MS) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    toasts.value = [...toasts.value, { id, kind, message }]

    if (durationMs > 0) {
      setTimeout(() => removeToast(id), durationMs)
    }

    return id
  }

  return {
    toasts,
    removeToast,
    pushSuccess: (message: string, durationMs?: number) => pushToast('success', message, durationMs),
    pushError: (message: string, durationMs?: number) => pushToast('error', message, durationMs),
    pushInfo: (message: string, durationMs?: number) => pushToast('info', message, durationMs),
  }
}