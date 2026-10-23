import { Star, Zap, ShieldCheck, TrendingUp, Award } from 'lucide-react'

const ICONS = {
  star: Star,
  zap: Zap,
  'shield-check': ShieldCheck,
  'trending-up': TrendingUp,
}

export function BadgeList({ badges }) {
  if (!badges || badges.length === 0) {
    return <p className="text-sm text-muted">No badges earned yet.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const Icon = ICONS[badge.icon] ?? Award
        return (
          <div
            key={badge.id}
            title={badge.description}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5"
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-ink">{badge.name}</span>
          </div>
        )
      })}
    </div>
  )
}