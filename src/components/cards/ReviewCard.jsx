import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function ReviewCard({ review }) {
  const name = review.customer?.full_name ?? 'SurePro customer'
  const avatarUrl = review.customer?.avatar_url

  return (
    <div className="rounded-card border border-border bg-surface p-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-bg">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted">
              {name[0]}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="text-xs text-muted">
            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={
                i < review.rating
                  ? 'h-3.5 w-3.5 fill-warning text-warning'
                  : 'h-3.5 w-3.5 text-border'
              }
            />
          ))}
        </div>
      </div>
      {review.comment && <p className="mt-2 text-sm text-ink-soft">{review.comment}</p>}
    </div>
  )
}