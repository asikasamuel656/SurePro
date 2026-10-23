export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-primary" />}
      </div>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  )
}