
import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import {
  Briefcase,
  Tag,
  Flag,
  MoreHorizontal,
  Reply,
  Copy,
  Forward,
  Trash2,
} from 'lucide-react'

import { clsx } from '@/utils/clsx'
import { ReportModal } from '@/features/safety/components/ReportModal'

export function MessageBubble({
  message,
  isOwn,
  onReply,
  onCopy,
  onForward,
  onDelete,
  isDeleting = false,
}) {
  const [reportOpen, setReportOpen] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const actionsRef = useRef(null)

  const time = message.created_at
    ? format(new Date(message.created_at), 'h:mm a')
    : ''

  const forwarded = Boolean(message.metadata?.forwarded)
  const replyTo = message.metadata?.reply_to

  // Close the action menu when the user clicks outside it.
  useEffect(() => {
    if (!showActions) return

    function handleOutsideClick(event) {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target)
      ) {
        setShowActions(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setShowActions(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showActions])

  return (
    <div
      className={clsx(
        'group flex items-center gap-1',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        ref={actionsRef}
        className="relative flex max-w-full items-center gap-1"
      >
        <div
          className={clsx(
            'max-w-[min(78vw,28rem)] rounded-2xl px-3.5 py-2.5 sm:max-w-[75%]',
            isOwn
              ? 'rounded-br-sm bg-primary text-white'
              : 'rounded-bl-sm bg-bg text-ink'
          )}
        >
          {forwarded && (
            <div className="mb-1 flex items-center gap-1 text-[11px] opacity-75">
              <Forward className="h-3 w-3" />
              Forwarded
            </div>
          )}

          {replyTo && (
            <div
              className={clsx(
                'mb-2 rounded-lg border-l-2 px-2.5 py-1.5 text-xs',
                isOwn
                  ? 'border-white/60 bg-white/10 text-white/80'
                  : 'border-primary bg-surface text-muted'
              )}
            >
              <p className="font-semibold">Reply to message</p>
              <p className="mt-0.5 line-clamp-2 break-words">
                {replyTo.content || 'Attachment'}
              </p>
            </div>
          )}

          {message.message_type === 'image' && message.image_url && (
            <img
              src={message.image_url}
              alt="Shared image"
              className="mb-1.5 max-h-64 rounded-xl object-cover"
            />
          )}

          {message.message_type === 'job_update' && (
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold opacity-90">
              <Briefcase className="h-3.5 w-3.5" />
              Job update
            </div>
          )}

          {message.message_type === 'quote' && (
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold opacity-90">
              <Tag className="h-3.5 w-3.5" />
              Quote
            </div>
          )}

          {message.content && (
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </p>
          )}

          <p
            className={clsx(
              'mt-1 text-right text-[10px]',
              isOwn ? 'text-white/70' : 'text-muted'
            )}
          >
            {time}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowActions((value) => !value)}
          className={clsx(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink',
            showActions
              ? 'bg-surface opacity-100'
              : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          )}
          aria-label="Message options"
          aria-expanded={showActions}
          aria-haspopup="menu"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {showActions && (
          <div
            role="menu"
            className={clsx(
              'absolute top-9 z-30 min-w-44 rounded-xl border border-border bg-surface p-1 shadow-xl',
              isOwn ? 'right-0' : 'left-0'
            )}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setShowActions(false)
                onReply?.(message)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-ink hover:bg-bg"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setShowActions(false)
                onCopy?.(message)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-ink hover:bg-bg"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setShowActions(false)
                onForward?.(message)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-ink hover:bg-bg"
            >
              <Forward className="h-3.5 w-3.5" />
              Forward
            </button>

            {isOwn ? (
              <button
                type="button"
                role="menuitem"
                disabled={isDeleting}
                onClick={() => {
                  setShowActions(false)
                  onDelete?.(message)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete message
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowActions(false)
                  setReportOpen(true)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-danger hover:bg-danger/10"
              >
                <Flag className="h-3.5 w-3.5" />
                Report message
              </button>
            )}
          </div>
        )}
      </div>

      {reportOpen && (
        <ReportModal
          targetType="message"
          targetId={message.id}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  )
}
