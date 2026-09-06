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

export function CategoryPill({ category, selected, onSelect }) {
  const Icon = ICONS[category.icon] ?? Grid2x2

  return (
    <button
      type="button"
      onClick={() => onSelect(selected ? null : category.id)}
      className={clsx(
        'flex shrink-0 flex-col items-center gap-1.5 rounded-card border px-4 py-3 text-xs font-medium',
        selected
          ? 'border-primary bg-primary-light text-primary'
          : 'border-border bg-surface text-ink-soft'
      )}
    >
      <Icon className="h-5 w-5" />
      {category.name}
    </button>
  )
}