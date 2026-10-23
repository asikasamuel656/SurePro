import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Tag, CheckCircle2, Navigation, MapPin, Star, UserPlus, Heart, MessageSquare, Bell } from 'lucide-react'
import { clsx } from '@/utils/clsx'

const ICONS = {
  new_message: MessageCircle,
  new_quote: Tag,
  job_accepted: CheckCircle2,
  professional_on_the_way: Navigation,
  professional_arrived: MapPin,
  new_review: Star,
  new_follow: UserPlus,
  new_like: Heart,
  new_comment: MessageSquare,
}

export function NotificationItem({ notification, onClick }) {
  const Icon = ICONS[notification.type] ?? Bell

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left',
        !notification.is_read && 'bg-primary-light/40'
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={clsx('text-sm', notification.is_read ? 'font-medium text-ink' : 'font-bold text-ink')}>
          {notification.title}
        </p>
        {notification.body && <p className="mt-0.5 text-sm text-muted">{notification.body}</p>}
        <p className="mt-1 text-xs text-muted">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </button>
  )
}