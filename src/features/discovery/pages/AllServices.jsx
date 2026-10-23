import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { CategoryPill } from '../components/CategoryPill'
import { ROUTES } from '@/constants/routes'

function groupAlphabetically(categories) {
  const groups = {}
  for (const category of categories) {
    const letter = category.name[0]?.toUpperCase() ?? '#'
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(category)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

export function AllServices() {
  const navigate = useNavigate()
  const { data: categories = [], isLoading } = useCategories()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(term))
  }, [categories, search])

  const grouped = useMemo(() => groupAlphabetically(filtered), [filtered])

  const goToCategory = (categoryId) => {
    navigate(ROUTES.DISCOVER, { state: { categoryId } })
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-ink">All services</h1>
        </div>

        <div className="sticky top-0 z-10 bg-surface px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services"
              className="w-full rounded-control border border-border bg-bg py-3 pl-11 pr-4 text-[15px] placeholder:text-muted focus:border-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {isLoading && (
            <div className="space-y-2 pt-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-card bg-surface" />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="mt-6 rounded-card border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium text-ink">No services match "{search}"</p>
              <p className="mt-1 text-sm text-muted">Try a different search term.</p>
            </div>
          )}

          {!isLoading &&
            grouped.map(([letter, items]) => (
              <div key={letter} className="pt-3">
                <div className="sticky top-[3.75rem] z-[5] -mx-4 bg-bg px-4 py-1.5 text-xs font-bold text-muted">
                  {letter}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {items.map((category) => (
                    <CategoryPill
                      key={category.id}
                      category={category}
                      selected={false}
                      onSelect={() => goToCategory(category.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}