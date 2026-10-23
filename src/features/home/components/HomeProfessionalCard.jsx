import { useNavigate } from 'react-router-dom'
import { Star, MapPin, BadgeCheck } from 'lucide-react'
import { professionalProfilePath } from '@/constants/routes'
import { formatDistance } from '@/utils/distance'

export function HomeProfessionalCard({ professional }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(professionalProfilePath(professional.id))}
      className="w-25 shrink-0 rounded-card border border-border bg-surface p-1.5 text-left"
    >
      <div className="h-9 w-9 overflow-hidden rounded-full bg-bg">
        {professional.avatar_url ? (
          <img src={professional.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted">
            {professional.full_name?.[0] ?? '?'}
          </div>
        )}
      </div>
      <div className="mt-1 flex min-w-0 items-center gap-0.5">
        <p className="min-w-0 truncate text-[11px] font-semibold text-ink">{professional.full_name}</p>
        <BadgeCheck size={10} className="shrink-0 text-primary" />
      </div>
      <p className="truncate text-[10px] text-muted">{professional.category?.name}</p>
      <div className="mt-0.5 flex items-center gap-1 text-[9px] text-ink-soft">
        <span className="flex items-center gap-0.5">
          <Star size={9} className="fill-warning text-warning" />
          {professional.rating?.toFixed ? professional.rating.toFixed(1) : 'New'}
        </span>
        {professional.distanceKm != null && (
          <span className="flex items-center gap-0.5 truncate">
            <MapPin size={9} className="shrink-0" />
            {formatDistance(professional.distanceKm)}
          </span>
        )}
      </div>
    </button>
  )
}