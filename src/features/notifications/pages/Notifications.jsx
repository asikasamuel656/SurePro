import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationItem } from '../components/NotificationItem'
import {
  chatPath,
  jobDetailsPath,
  postDetailsPath,
} from '@/constants/routes'

function resolvePath(notification) {
  const data = notification?.data ?? {}

  switch (notification?.type) {
    // -----------------------------
    // CHAT
    // -----------------------------
    case 'new_message':
    case 'message':
      return data.conversation_id
        ? chatPath(data.conversation_id)
        : null

    // -----------------------------
    // JOB / QUOTE
    // -----------------------------
    case 'new_quote':
    case 'quote_accepted':
    case 'quote_rejected':
    case 'job_accepted':
    case 'job_assigned':
    case 'job_status':
    case 'job_preparing':
    case 'job_on_the_way':
    case 'professional_on_the_way':
    case 'professional_arrived':
    case 'job_arrived':
    case 'job_started':
    case 'job_in_progress':
    case 'job_completed':
    case 'job_cancelled':
    case 'new_job':
      return data.job_id
        ? jobDetailsPath(data.job_id)
        : null

    // -----------------------------
    // FEED / POSTS
    // -----------------------------
    case 'new_like':
    case 'post_liked':
    case 'new_comment':
    case 'post_commented':
    case 'new_post':
    case 'post_saved':
      return data.post_id
        ? postDetailsPath(data.post_id)
        : null

    default:
      return null
  }
}

export function Notifications() {
  const navigate = useNavigate()

  const {
    notifications,
    isLoading,
    isError,
    markRead,
    markAllRead,
  } = useNotifications()

  const handleClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markRead(notification.id)
      }
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      )
    }

    const path = resolvePath(notification)

    if (path) {
      navigate(path)
    }
  }

  const hasUnread = notifications.some(
    (notification) => !notification.is_read
  )

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft transition-colors hover:bg-bg"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h1 className="flex-1 text-base font-bold text-ink">
            Notifications
          </h1>

          {hasUnread && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="text-xs font-semibold text-primary"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification content */}
        <div className="flex-1 overflow-y-auto">

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-card bg-surface"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="m-4 rounded-card border border-danger/20 bg-danger/10 p-4">
              <p className="text-sm font-semibold text-danger">
                Couldn't load notifications.
              </p>

              <p className="mt-1 text-xs text-danger/80">
                Please try again in a moment.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading &&
            !isError &&
            notifications.length === 0 && (
              <div className="mx-4 mt-6 rounded-card border border-dashed border-border bg-surface p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg text-xl">
                  🔔
                </div>

                <p className="mt-3 text-sm font-semibold text-ink">
                  No notifications yet
                </p>

                <p className="mt-1 text-sm leading-5 text-muted">
                  Activity on your jobs, quotes, posts,
                  comments, likes, and messages will appear here.
                </p>
              </div>
            )}

          {/* Notifications */}
          {!isLoading &&
            !isError &&
            notifications.length > 0 && (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleClick(notification)}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}