import { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { TopBar } from '@/components/layout/TopBar'
import { PageContainer } from '@/components/layout/PageContainer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { ProfessionalCard } from '@/components/cards/ProfessionalCard'
import { WorkPreviewCard } from '@/features/home/components/WorkPreviewCard'
import { SearchBar } from '../components/SearchBar'
import { CategoryPill } from '../components/CategoryPill'
import { FilterSheet } from '../components/FilterSheet'
import { useCategories } from '../hooks/useCategories'
import { useNearbyProfessionals } from '../hooks/useNearbyProfessionals'
import { useFeed } from '@/features/feed/hooks/useFeed'
import { LocationPrompt } from '@/features/location/components/LocationPrompt'
import { ROUTES, professionalProfilePath } from '@/constants/routes'
import { clsx } from "@/utils/Clsx";

const TABS = [
  { key: 'professionals', label: 'Professionals' },
  { key: 'services', label: 'Services' },
  { key: 'work', label: 'Work' },
]

export function Discover() {
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState('professionals')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(location.state?.categoryId ?? null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('distance')

  useEffect(() => {
    if (location.state?.categoryId) {
      setCategoryId(location.state.categoryId)
      setTab('professionals')
    }
  }, [location.state])

  const { data: categories = [] } = useCategories()
  const { professionals, isLoading, isError } = useNearbyProfessionals({
    categoryId,
    searchTerm: tab === 'professionals' ? search : '',
  })
  const { data: workPosts = [], isLoading: isWorkLoading } = useFeed({
    searchTerm: tab === 'work' ? search : undefined,
  })

  const sorted = useMemo(() => {
    if (sortBy === 'rating') return [...professionals].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    if (sortBy === 'jobs')
      return [...professionals].sort((a, b) => (b.completed_jobs ?? 0) - (a.completed_jobs ?? 0))
    return professionals
  }, [professionals, sortBy])

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [categories, search])

  return (
    <CustomerLayout>
      <TopBar />

      <LocationPrompt />

      <div className="space-y-3 pb-2">
        <SearchBar value={search} onChange={setSearch} onFilterClick={() => setFilterOpen(true)} />

        <div className="flex gap-2 px-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                tab === t.key ? 'bg-primary-light text-primary' : 'bg-bg text-muted'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'professionals' && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-6 pb-1">
            {categories.slice(0, 7).map((category) => (
              <CategoryPill
                key={category.id}
                category={category}
                selected={categoryId === category.id}
                onSelect={setCategoryId}
              />
            ))}
          </div>
        )}
      </div>

      <PageContainer className="px-6">
        {tab === 'professionals' && (
          <>
            <h2 className="mb-3 text-base font-bold text-ink">
              {categoryId ? 'Matching professionals' : 'Recommended for you'}
            </h2>

            {isLoading && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-card bg-bg" />
                ))}
              </div>
            )}

            {isError && (
              <p className="rounded-card bg-danger/10 p-4 text-sm text-danger">
                Couldn't load professionals right now. Pull to refresh or try again shortly.
              </p>
            )}

            {!isLoading && !isError && sorted.length === 0 && (
              <div className="rounded-card border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-ink">
                  {categoryId ? 'No professionals found nearby.' : 'No professionals here yet.'}
                </p>
                <p className="mt-1 text-sm text-muted">Try widening your search.</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft"
                    >
                      Clear search
                    </button>
                  )}
                  {categoryId && (
                    <button
                      type="button"
                      onClick={() => setCategoryId(null)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft"
                    >
                      Remove category filter
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.LOCATION_PERMISSION)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft"
                  >
                    Change location
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onClick={() => navigate(professionalProfilePath(professional.id))}
                />
              ))}
            </div>
          </>
        )}

        {tab === 'services' && (
          <>
            <h2 className="mb-3 text-base font-bold text-ink">Services</h2>
            {filteredCategories.length === 0 ? (
              <div className="rounded-card border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-ink">No services match "{search}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {filteredCategories.map((category) => (
                  <CategoryPill
                    key={category.id}
                    category={category}
                    selected={categoryId === category.id}
                    onSelect={(id) => {
                      setCategoryId(id)
                      setTab('professionals')
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'work' && (
          <>
            <h2 className="mb-3 text-base font-bold text-ink">Work</h2>
            {isWorkLoading && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-40 animate-pulse rounded-card bg-bg" />
                ))}
              </div>
            )}
            {!isWorkLoading && workPosts.length === 0 && (
              <div className="rounded-card border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-ink">No matching work found</p>
                <p className="mt-1 text-sm text-muted">Try a different search term.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {workPosts.map((post) => (
                <WorkPreviewCard key={post.id} post={post} className="w-full" />
              ))}
            </div>
          </>
        )}
      </PageContainer>

      <BottomNavigation />

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
    </CustomerLayout>
  )
}