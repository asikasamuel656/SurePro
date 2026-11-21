
import {
  format,
  isValid,
  isYesterday,
  isToday,
} from 'date-fns'
import { clsx } from '@/utils/clsx'

export function ConversationListItem({ conversation, onClick }) {
  const { otherUser, lastMessage, unreadCount } = conversation

  const name = otherUser?.full_name ?? 'SurePro user'

  const preview =
    lastMessage?.message_type === 'text'
      ? lastMessage.content
      : lastMessage
        ? 'Sent an attachment'
        : 'Say hello 👋'

  // Use the latest message timestamp instead of the conversation
  // timestamp, which might not change when a new message is sent.
  const timestamp = lastMessage?.created_at

  const messageDate = timestamp ? new Date(timestamp) : null

  const relativeTime =
  messageDate && isValid(messageDate)
    ? isToday(messageDate)
      ? format(messageDate, 'h:mm a')
      : isYesterday(messageDate)
        ? 'Yesterday'
        : format(messageDate, 'd MMM')
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left"
    >
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-bg">
        {otherUser?.avatar_url ? (
          <img
            src={otherUser.avatar_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted">
            {name[0]}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={clsx(
              'truncate text-sm',
              unreadCount > 0
                ? 'font-bold text-ink'
                : 'font-semibold text-ink'
            )}
          >
            {name}
          </p>

          {relativeTime && (
            <span className="shrink-0 text-[11px] text-muted">
              {relativeTime}
            </span>
          )}
        </div>

        <p
          className={clsx(
            'truncate text-sm',
            unreadCount > 0 ? 'font-semibold text-ink' : 'text-muted'
          )}
        >
          {preview}
        </p>
      </div>

      {unreadCount > 0 && (
        <span
          aria-label={`${unreadCount} unread messages`}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-[11px] font-bold text-white"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
