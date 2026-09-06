function formatPrice(min, max) {
  if (min == null && max == null) return 'Price on request'
  const fmt = (n) => `₦${Number(n).toLocaleString()}`
  if (min != null && max != null && min !== max) return `${fmt(min)} – ${fmt(max)}`
  return fmt(min ?? max)
}

export function ServiceList({ services }) {
  if (services.length === 0) {
    return <p className="text-sm text-muted">No services listed yet.</p>
  }

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-3"
        >
          <div>
            <p className="text-sm font-semibold text-ink">{service.name}</p>
            {service.description && (
              <p className="mt-0.5 text-xs text-muted">{service.description}</p>
            )}
          </div>
          <span className="shrink-0 text-sm font-semibold text-primary">
            {formatPrice(service.price_min, service.price_max)}
          </span>
        </div>
      ))}
    </div>
  )
}