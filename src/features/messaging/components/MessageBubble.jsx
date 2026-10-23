import { useState } from 'react'
import { format } from 'date-fns'
import { Briefcase, Tag, Flag } from 'lucide-react'
import { clsx } from '@/utils/clsx'
import { ReportModal } from '@/features/safety/components/ReportModal'

export function MessageBubble({ message, isOwn }) {
  const time = format(new Date(message.created_at), 'h:mm a')
  const [reportOpen, setReportOpen] = useState(false)
  const [showActions, setShowActions] = useState(false)

  return (
    <div className={clsx('group flex items-center gap-1', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn && (
        <button
          type="button"
          onClick={() => setShowActions((v) => !v)}
          className="opacity-0 group-hover:opacity-100 text-muted"
          aria-label="Message options"
        >
          <Flag className="h-3.5 w-3.5" />
        </button>
      )}

      <div
        className={clsx(
          'max-w-[75%] rounded-2xl px-3.5 py-2.5',
          isOwn ? 'rounded-br-sm bg-primary text-white' : 'rounded-bl-sm bg-bg text-ink'
        )}
      >
        {message.message_type === 'image' && message.image_url && (
          <img src={message.image_url} alt="" className="mb-1.5 max-h-64 w-full rounded-xl object-cover" />
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

        {message.content && <p className="whitespace-pre-wrap text-sm">{message.content}</p>}

        <p className={clsx('mt-1 text-right text-[10px]', isOwn ? 'text-white/70' : 'text-muted')}>
          {time}
        </p>
      </div>

      {showActions && !isOwn && (
        <div className="absolute z-10 mt-8 rounded-card border border-border bg-surface p-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setReportOpen(true)
              setShowActions(false)
            }}
            className="flex items-center gap-2 whitespace-nowrap rounded-control px-3 py-2 text-xs font-medium text-danger"
          >
            <Flag className="h-3.5 w-3.5" />
            Report message
          </button>
        </div>
      )}

      {reportOpen && (
        <ReportModal targetType="message" targetId={message.id} onClose={() => setReportOpen(false)} />
      )}
    </div>
  )
}