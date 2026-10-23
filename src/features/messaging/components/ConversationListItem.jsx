import { formatDistanceToNow } from 'date-fns'
import { clsx } from '@/utils/clsx'

export function ConversationListItem({ conversation, onClick }) {
  const { otherUser, lastMessage, unreadCount, updatedAt } = conversation
  const name = otherUser?.full_name ?? 'SurePro user'
  const preview =
    lastMessage?.message_type === 'text'
      ? lastMessage.content
      : lastMessage
        ? 'Sent an attachment'
        : 'Say hello 👋'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left"
    >
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-bg">
        {otherUser?.avatar_url ? (
          <img src={otherUser.avatar_url} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted">
            {name[0]}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={clsx('truncate text-sm', unreadCount > 0 ? 'font-bold text-ink' : 'font-semibold text-ink')}>
            {name}
          </p>
          {updatedAt && (
            <span className="shrink-0 text-[11px] text-muted">
              {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
            </span>
          )}
        </div>
        <p className={clsx('truncate text-sm', unreadCount > 0 ? 'font-semibold text-ink' : 'text-muted')}>
          {preview}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  )
}