const METRICS = [
  { key: 'reliability_score', label: 'Reliability' },
  { key: 'communication_score', label: 'Communication' },
  { key: 'timeliness_score', label: 'Timeliness' },
  { key: 'response_rate', label: 'Response rate', isPercent: true },
  { key: 'completion_rate', label: 'Completion rate', isPercent: true },
]

export function ReputationBreakdown({ profile }) {
  const hasAnyData = METRICS.some((m) => profile[m.key] != null)

  if (!hasAnyData) {
    return (
      <p className="text-sm text-muted">
        Reputation breakdown builds up as this professional completes more jobs.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {METRICS.map(({ key, label, isPercent }) => {
        const value = profile[key]
        if (value == null) return null
        const pct = isPercent ? value : (value / 5) * 100
        const display = isPercent ? `${Math.round(value)}%` : `${value.toFixed(1)}/5`

        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-ink-soft">{label}</span>
              <span className="text-muted">{display}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
              />
            </div>
          </div>
        )
      })}
      {profile.repeat_customers > 0 && (
        <p className="text-xs text-muted">
          {profile.repeat_customers} repeat {profile.repeat_customers === 1 ? 'customer' : 'customers'}
        </p>
      )}
    </div>
  )
}