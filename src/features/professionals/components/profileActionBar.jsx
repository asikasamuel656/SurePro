import { Heart, Send } from 'lucide-react'
import { clsx } from '@/utils/clsx'

export function ProfileActionBar({ isSaved, onToggleSave, onHire, onShare }) {
  return (
    <div className="border-t border-border bg-surface px-6 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={isSaved ? 'Unsave' : 'Save'}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-border"
        >
          <Heart className={clsx('h-5 w-5', isSaved ? 'fill-danger text-danger' : 'text-ink-soft')} />
        </button>

        <button
          type="button"
          onClick={onHire}
          className="flex flex-1 flex-col items-center justify-center rounded-control bg-primary py-2.5 text-white"
        >
          <span className="text-sm font-bold">Request Service</span>
          <span className="text-[11px] opacity-90">Get a response within minutes</span>
        </button>

        <button
          type="button"
          onClick={onShare}
          aria-label="Share"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-border text-ink-soft"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}