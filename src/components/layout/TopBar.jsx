import { ChevronDown, Bell, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLocationStore } from '@/store/locationStore'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { useUnreadMessageCount } from '@/features/messaging/hooks/useUnreadMessageCount'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

function Badge({ count }) {
  if (!count) return null
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.125rem] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
      {count > 9 ? '9+' : count}
    </span>
  )
}

export function TopBar() {
  const navigate = useNavigate()
  const label = useLocationStore((s) => s.label)
  const unreadNotifications = useUnreadCount()
  const unreadMessages = useUnreadMessageCount()
  const { profile } = useAuth()

  return (
    <div className="flex items-center justify-between px-6 pb-2 pt-5">
      <button
        type="button"
        onClick={() => navigate(ROUTES.PROFILE)}
        aria-label="Profile"
        className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-bg"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted">
            {profile?.full_name?.[0] ?? '?'}
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={() => navigate(ROUTES.LOCATION_PERMISSION)}
        className="flex items-center gap-1 text-sm font-semibold text-ink"
      >
        <span className="text-muted">Serving:</span>
        <span className="max-w-[7rem] truncate text-primary">{label ?? 'Set location'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(ROUTES.CONVERSATIONS)}
          aria-label="Messages"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
        >
          <MessageCircle className="h-5 w-5" />
          <Badge count={unreadMessages} />
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
        >
          <Bell className="h-5 w-5" />
          <Badge count={unreadNotifications} />
        </button>
      </div>
    </div>
  )
}