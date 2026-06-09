import { useApiClient } from './useApiClient'
import { useToasts } from './useToasts'

interface NotificationItem {
  id: number
  title: string
  body: string
  type: string
  is_read: boolean
  data?: Record<string, unknown>
  created_at?: string
}

interface NotificationsResponse {
  items: NotificationItem[]
  unread_count: number
}

const POLL_INTERVAL_MS = 15000
const PAGE_SIZE = 20

// Single shared timer across all callers (layout starts it, sidebar only reads
// the reactive count). Module-scoped so re-invoking the composable never spawns
// a second poll loop.
let pollTimer: ReturnType<typeof setInterval> | null = null

// Live, in-app notification feed for the admin web. There is no server push
// wired (notifications are persisted rows, see the API NotificationService), so
// staff/trainers stay current by short-interval polling of their own unread
// feed. New arrivals raise a toast and drive the sidebar unread badge, so a
// member booking/cancelling on mobile surfaces without a manual page reload.
export const useNotificationsFeed = () => {
  const unreadCount = useState<number>('notifications-unread-count', () => 0)
  const lastSeenId = useState<number>('notifications-last-seen-id', () => 0)
  const baselined = useState<boolean>('notifications-feed-baselined', () => false)

  const api = useApiClient()
  const toasts = useToasts()

  const poll = async () => {
    try {
      const res = await api.get<NotificationsResponse>(
        '/notifications',
        { is_read: false, page: 1, page_size: PAGE_SIZE },
        true,
      )

      const items = res.items || []
      unreadCount.value = typeof res.unread_count === 'number' ? res.unread_count : items.length

      const maxId = items.reduce((max, item) => Math.max(max, item.id), 0)

      // First successful poll only establishes a baseline so we never toast the
      // backlog of notifications that already existed before the page loaded.
      if (!baselined.value) {
        lastSeenId.value = maxId
        baselined.value = true
        return
      }

      const fresh = items
        .filter((item) => item.id > lastSeenId.value)
        .sort((a, b) => a.id - b.id)

      for (const item of fresh) {
        toasts.pushInfo(item.body ? `${item.title}: ${item.body}` : item.title)
      }

      if (maxId > lastSeenId.value) {
        lastSeenId.value = maxId
      }
    } catch {
      // Swallow transient polling errors (offline, token refresh races); the
      // next tick recovers. Auth failures are handled inside the API client.
    }
  }

  const start = () => {
    if (pollTimer) {
      return
    }
    void poll()
    pollTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return
      }
      void poll()
    }, POLL_INTERVAL_MS)
  }

  const stop = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    // Re-baseline on next start (e.g. after re-login) so a fresh session does
    // not replay history as toasts.
    baselined.value = false
  }

  return {
    unreadCount,
    poll,
    start,
    stop,
  }
}
