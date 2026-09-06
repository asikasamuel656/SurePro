import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { TopBar } from '@/components/layout/TopBar'
import { PageContainer } from '@/components/layout/PageContainer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { ProfessionalCard } from '@/components/cards/ProfessionalCard'
import { SearchBar } from '../components/SearchBar'
import { CategoryPill } from '../components/CategoryPill'
import { FilterSheet } from '../components/FilterSheet'
import { useCategories } from '../hooks/useCategories'
import { useNearbyProfessionals } from '../hooks/useNearbyProfessionals'
import { useLocationStore } from '@/store/locationStore'
import { ROUTES, professionalProfilePath } from '@/constants/routes'

export function Home() {
  const navigate = useNavigate()
  const permissionStatus = useLocationStore((s) => s.permissionStatus)

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('distance')

  const { data: categories = [] } = useCategories()
  const { professionals, isLoading, isError } = useNearbyProfessionals({
    categoryId,
    searchTerm: search,
  })

  const sorted = useMemo(() => {
    if (sortBy === 'rating') return [...professionals].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    if (sortBy === 'jobs')
      return [...professionals].sort((a, b) => (b.completed_jobs ?? 0) - (a.completed_jobs ?? 0))
    return professionals
  }, [professionals, sortBy])

  return (
    <CustomerLayout>
      <TopBar />

      {permissionStatus === 'unset' && (
        <button
          type="button"
          onClick={() => navigate(ROUTES.LOCATION_PERMISSION)}
          className="mx-6 mb-2 rounded-control bg-primary-light px-4 py-2.5 text-left text-sm font-medium text-primary"
        >
          Set your location to see professionals near you →
        </button>
      )}

      <div className="space-y-4 pb-4">
        <SearchBar value={search} onChange={setSearch} onFilterClick={() => setFilterOpen(true)} />

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-6 pb-1">
            {categories.map((category) => (
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
            <p className="text-sm font-medium text-ink">No professionals here yet</p>
            <p className="mt-1 text-sm text-muted">
              Check back soon, or widen your search to see more of SurePro.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sorted.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onClick={() => navigate(professionalProfilePath(professional.id))}
            />
          ))}
        </div>
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