import { useMemo, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { clsx } from '@/utils/clsx'

export function ServiceSearch({
  categories = [],
  selectedId,
  onSelect,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedCategory = categories.find(
    (category) => category.id === selectedId
  )

  const filteredCategories = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (!search) return categories

    return categories.filter((category) =>
      category.name.toLowerCase().includes(search)
    )
  }, [categories, query])

  const handleSelect = (category) => {
    onSelect(category.id)
    setQuery('')
    setOpen(false)
  }

  const handleClear = () => {
    onSelect(null)
    setQuery('')
  }

  return (
    <div className="relative">
      <div className="mb-2">
        <p className="text-sm font-semibold text-ink">
          What service do you need?
        </p>

        <p className="mt-0.5 text-xs text-muted">
          Search for the type of professional you need.
        </p>
      </div>

      {/* Selected service */}
      {selectedCategory ? (
        <div className="flex items-center gap-3 rounded-control border border-primary bg-primary-light px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg">
            {selectedCategory.icon || '🔧'}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary-dark">
              {selectedCategory.name}
            </p>

            <p className="text-xs text-muted">
              Service selected
            </p>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white hover:text-ink"
            aria-label="Change service"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Search input */}
          <div
            className={clsx(
              'flex items-center gap-2 rounded-control border bg-surface px-4 transition',
              open
                ? 'border-primary ring-2 ring-primary/10'
                : 'border-border'
            )}
          >
            <Search className="h-4 w-4 shrink-0 text-muted" />

            <input
              type="text"
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              placeholder="Search services..."
              className="h-12 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />

            <ChevronDown
              className={clsx(
                'h-4 w-4 shrink-0 text-muted transition-transform',
                open && 'rotate-180'
              )}
            />
          </div>

          {/* Results */}
          {open && (
            <>
              <button
                type="button"
                aria-label="Close service search"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setOpen(false)}
              />

              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-lg">
                {filteredCategories.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-bg">
                      <Search className="h-4 w-4 text-muted" />
                    </div>

                    <p className="text-sm font-medium text-ink">
                      No service found
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      Try another search term.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleSelect(category)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-bg"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-lg">
                          {category.icon || '🔧'}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">
                            {category.name}
                          </p>

                          {category.description && (
                            <p className="truncate text-xs text-muted">
                              {category.description}
                            </p>
                          )}
                        </div>

                        {selectedId === category.id && (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}