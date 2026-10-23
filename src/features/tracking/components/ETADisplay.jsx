import { Navigation, Clock } from 'lucide-react'
import { distanceKm, formatDistance } from '@/utils/distance'

const ASSUMED_AVG_SPEED_KMH = 30 // rough urban driving average, for a ballpark ETA only

export function ETADisplay({ from, to }) {
  if (!from || !to) return null

  const km = distanceKm(from, to)
  const etaMinutes = Math.max(1, Math.round((km / ASSUMED_AVG_SPEED_KMH) * 60))

  return (
    <div className="flex items-center gap-4 rounded-card border border-border bg-surface p-3">
      <div className="flex items-center gap-1.5 text-sm">
        <Navigation className="h-4 w-4 text-primary" />
        <span className="font-semibold text-ink">{formatDistance(km)}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        <Clock className="h-4 w-4 text-primary" />
        <span className="font-semibold text-ink">~{etaMinutes} min</span>
      </div>
      <span className="ml-auto text-xs text-muted">Estimate</span>
    </div>
  )
}