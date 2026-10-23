import {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  PaintRoller,
  Trees,
  Truck,
  Refrigerator,
  Grid2x2,
} from 'lucide-react'
import { clsx } from '@/utils/clsx'

const ICONS = {
  plumbing: Wrench,
  electrical: Zap,
  cleaning: Sparkles,
  carpentry: Hammer,
  painting: PaintRoller,
  gardening: Trees,
  movers: Truck,
  appliance_repair: Refrigerator,
}

export function CategoryPill({
  category,
  selected,
  onSelect,
}) {
  const Icon = ICONS[category.icon] ?? Grid2x2

  return (
    <button
      type="button"
      onClick={() =>
        onSelect(selected ? null : category.id)
      }
        className={clsx(
            'flex min-w-0 w-full flex-col items-center justify-center gap-2 rounded-card border px-2 py-3 text-center transition-colors',
            selected
            ? 'border-primary bg-primary-light text-primary'
            : 'border-border bg-surface text-ink-soft hover:border-primary hover:bg-primary-light hover:text-primary'
        )}
    >
        <div
            className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                selected
                ? 'bg-primary/10'
                : 'bg-bg group-hover:bg-primary/10'
            )}
            >
            <Icon className="h-5 w-5" />
        </div>

      <span className="w-full truncate text-[11px] font-medium">
        {category.name}
      </span>
    </button>
  )
}