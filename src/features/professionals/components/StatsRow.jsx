import { CalendarClock, CheckCircle2, Clock3, Repeat } from 'lucide-react'

export function StatsRow({ yearsExperience, completedJobs, completionRate, repeatCustomers }) {
  const stats = [
    {
      key: 'years',
      icon: CalendarClock,
      value: yearsExperience != null ? `${yearsExperience}+` : '—',
      label: 'Years Exp.',
    },
    {
      key: 'jobs',
      icon: CheckCircle2,
      value: completedJobs ?? 0,
      label: 'Jobs done',
    },
    {
      key: 'ontime',
      icon: Clock3,
      value: completionRate != null ? `${Math.round(completionRate)}%` : '—',
      label: 'Completion',
    },
    {
      key: 'repeat',
      icon: Repeat,
      value: repeatCustomers ?? 0,
      label: 'Repeat clients',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map(({ key, icon: Icon, value, label }) => (
        <div key={key} className="flex flex-col items-center gap-1 rounded-card border border-border bg-surface py-3 text-center">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-ink">{value}</span>
          <span className="text-[10px] leading-tight text-muted">{label}</span>
        </div>
      ))}
    </div>
  )
}