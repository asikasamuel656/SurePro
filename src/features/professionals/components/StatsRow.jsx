import { Star, CheckCircle2, CalendarClock, Users } from 'lucide-react'

const STATS = [
  { key: 'rating', icon: Star, label: 'Rating' },
  { key: 'completedJobs', icon: CheckCircle2, label: 'Jobs done' },
  { key: 'yearsExperience', icon: CalendarClock, label: 'Years' },
  { key: 'followers', icon: Users, label: 'Followers' },
]

export function StatsRow({ rating, completedJobs, yearsExperience, followers }) {
  const values = {
    rating: rating ? rating.toFixed(1) : 'New',
    completedJobs: completedJobs ?? 0,
    yearsExperience: yearsExperience ?? '—',
    followers: followers ?? 0,
  }

  return (
    <div className="grid grid-cols-4 gap-2 rounded-card border border-border bg-surface p-3">
      {STATS.map(({ key, icon: Icon, label }) => (
        <div key={key} className="flex flex-col items-center gap-1 text-center">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-ink">{values[key]}</span>
          <span className="text-[11px] text-muted">{label}</span>
        </div>
      ))}
    </div>
  )
}