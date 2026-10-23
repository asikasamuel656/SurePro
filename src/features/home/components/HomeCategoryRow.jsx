import { useNavigate } from 'react-router-dom'
import { Wrench, Zap, Sparkles, Hammer, PaintRoller, Trees, Truck, Refrigerator, Grid2x2 } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

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

export function HomeCategoryRow({ categories }) {
  const navigate = useNavigate()

  const goToCategory = (categoryId) => {
    navigate(ROUTES.DISCOVER, { state: { categoryId } })
  }

  return (
    <div className="flex gap-4 overflow-x-auto px-6 pb-1">
      {categories.slice(0, 5).map((category) => {
        const Icon = ICONS[category.icon] ?? Grid2x2
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => goToCategory(category.id)}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium text-ink-soft">{category.name}</span>
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => navigate(ROUTES.ALL_SERVICES)}
        className="flex shrink-0 flex-col items-center gap-1.5"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-ink-soft">
          <Grid2x2 className="h-5 w-5" />
        </span>
        <span className="text-[11px] font-medium text-ink-soft">More</span>
      </button>
    </div>
  )
}