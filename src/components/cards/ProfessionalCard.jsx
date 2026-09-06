import { Star, MapPin, BadgeCheck } from 'lucide-react'
import { clsx } from '@/utils/clsx'

export function ProfessionalCard({ professional, onClick }) {
  const {
    full_name: name,
    avatar_url: avatarUrl,
    category_name: categoryName,
    rating,
    is_available: isAvailable,
    distanceLabel,
  } = professional

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-card border border-border bg-surface p-3 text-left transition-colors hover:border-primary/40"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-bg">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted">
            {name?.[0] ?? '?'}
          </div>
        )}
        <span
          className={clsx(
            'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface',
            isAvailable ? 'bg-primary' : 'bg-muted'
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate font-semibold text-ink">{name}</span>
          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
        </div>
        <p className="truncate text-sm text-muted">{categoryName}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {rating?.toFixed ? rating.toFixed(1) : rating ?? 'New'}
          </span>
          {distanceLabel && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {distanceLabel}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}