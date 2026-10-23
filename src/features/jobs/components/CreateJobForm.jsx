import { useMemo, useState } from 'react'
import {
  MapPin,
  CheckCircle2,
  Navigation,
  Wallet,
  Search,
  X,
  ChevronDown,
} from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/features/discovery/hooks/useCategories'
import { useGeolocation } from '@/features/location/hooks/useGeolocation'
import {
  reverseGeocode,
  searchPlace,
} from '@/features/location/services/geocoding'
import { clsx } from '@/utils/clsx'

export function CreateJobForm({
  initialCategoryId,
  onSubmit,
  isSubmitting,
  error,
}) {
  const { data: categories = [] } = useCategories()

  const {
    requestLocation,
    isLocating,
    error: geolocationError,
  } = useGeolocation()

  const [categoryId, setCategoryId] = useState(
    initialCategoryId ?? null
  )

  const [serviceQuery, setServiceQuery] = useState('')
  const [serviceSearchOpen, setServiceSearchOpen] =
    useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState(null)

  const [locationSearch, setLocationSearch] = useState('')
  const [locationResults, setLocationResults] = useState([])
  const [isSearchingLocation, setIsSearchingLocation] =
    useState(false)
  const [locationError, setLocationError] = useState(null)

  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')

  const selectedCategory = categories.find(
    (category) => category.id === categoryId
  )

  const filteredCategories = useMemo(() => {
    const query = serviceQuery.trim().toLowerCase()

    if (!query) {
      return categories
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    )
  }, [categories, serviceQuery])

  const handleSelectService = (category) => {
    setCategoryId(category.id)
    setServiceQuery('')
    setServiceSearchOpen(false)
  }

  const handleClearService = () => {
    setCategoryId(null)
    setServiceQuery('')
    setServiceSearchOpen(false)
  }

  const handleUseCurrentLocation = async () => {
    setLocationError(null)

    try {
      const location = await requestLocation()

      setCoords({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy ?? null,
      })

      try {
        const resolved = await reverseGeocode(location)

        setAddress(
          resolved?.address ||
            resolved?.label ||
            'Current location'
        )
      } catch {
        setAddress('Current location')
      }
    } catch (error) {
      setLocationError(
        error?.message ||
          'Could not detect your location.'
      )
    }
  }

  const handleSearchLocation = async () => {
    const query = locationSearch.trim()

    if (!query) {
      setLocationResults([])
      return
    }

    setIsSearchingLocation(true)
    setLocationError(null)

    try {
      const results = await searchPlace(query)

      setLocationResults(results)

      if (results.length === 0) {
        setLocationError(
          'No matching locations were found.'
        )
      }
    } catch (error) {
      setLocationError(
        error?.message ||
          'Could not search for that location.'
      )
    } finally {
      setIsSearchingLocation(false)
    }
  }

  const handleSelectLocation = (result) => {
    setCoords({
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: null,
    })

    setAddress(
      result.address ||
        result.label ||
        'Selected location'
    )

    setLocationSearch('')
    setLocationResults([])
    setLocationError(null)
  }

  const canSubmit =
    !!categoryId &&
    !!title.trim() &&
    !!description.trim() &&
    !!address.trim() &&
    coords?.latitude != null &&
    coords?.longitude != null

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    onSubmit({
      categoryId,
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      budgetMin,
      budgetMax,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      {/* STEP 1 — SERVICE */}
      <section>
        <div className="mb-3">
          <p className="text-[10px] font-bold tracking-wider text-primary">
            STEP 1
          </p>

          <h2 className="mt-0.5 text-base font-bold text-ink">
            What service do you need?
          </h2>

          <p className="mt-1 text-xs text-muted">
            Search for the type of professional
            you need.
          </p>
        </div>

        {selectedCategory ? (
          <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary-light px-3.5 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg">
              {selectedCategory.icon || '🔧'}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-primary-dark">
                {selectedCategory.name}
              </p>

              <p className="mt-0.5 text-[10px] text-muted">
                Service selected
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearService}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white hover:text-ink"
              aria-label="Change service"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div
              className={clsx(
                'flex items-center gap-2 rounded-xl border bg-surface px-3.5 transition',
                serviceSearchOpen
                  ? 'border-primary ring-2 ring-primary/10'
                  : 'border-border'
              )}
            >
              <Search className="h-4 w-4 shrink-0 text-muted" />

              <input
                type="text"
                value={serviceQuery}
                onFocus={() =>
                  setServiceSearchOpen(true)
                }
                onChange={(event) => {
                  setServiceQuery(event.target.value)
                  setServiceSearchOpen(true)
                }}
                placeholder="Search services..."
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />

              <ChevronDown
                className={clsx(
                  'h-4 w-4 shrink-0 text-muted transition-transform',
                  serviceSearchOpen && 'rotate-180'
                )}
              />
            </div>

            {serviceSearchOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close service search"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() =>
                    setServiceSearchOpen(false)
                  }
                />

                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-lg">
                  {filteredCategories.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Search className="mx-auto mb-2 h-5 w-5 text-muted" />

                      <p className="text-sm font-medium text-ink">
                        No service found
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        Try another search term.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredCategories.map(
                        (category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() =>
                              handleSelectService(
                                category
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-bg"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-lg">
                              {category.icon || '🔧'}
                            </div>

                            <span className="flex-1 truncate text-sm font-medium text-ink">
                              {category.name}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <div className="h-px bg-border" />

      {/* STEP 2 — JOB DETAILS */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold tracking-wider text-primary">
            STEP 2
          </p>

          <h2 className="mt-0.5 text-base font-bold text-ink">
            Describe the job
          </h2>

          <p className="mt-1 text-xs text-muted">
            Give professionals enough information
            to understand what you need.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Job title"
            placeholder="e.g. Fix leaking kitchen pipe"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            required
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">
              What needs to be done?
            </span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              placeholder="Describe the problem, the work required, or anything the professional should know..."
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-5 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </label>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* STEP 3 — LOCATION */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold tracking-wider text-primary">
            STEP 3
          </p>

          <h2 className="mt-0.5 text-base font-bold text-ink">
            Where is the job?
          </h2>

          <p className="mt-1 text-xs text-muted">
            Give the professional the exact area
            where the service is needed.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg/50 p-3">
          <div className="flex items-start gap-3">
            <div className="mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light">
              <MapPin className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <Input
                label="Service address"
                placeholder="Where should the professional come?"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value)

                  // The old coordinates no longer
                  // necessarily match the new address.
                  setCoords(null)
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-surface py-2.5 text-xs font-semibold text-primary disabled:opacity-50"
          >
            <Navigation className="h-3.5 w-3.5" />

            {isLocating
              ? 'Finding your location...'
              : 'Use my current location'}
          </button>

          <div className="mt-3">
            <p className="mb-2 text-[10px] font-medium text-muted">
              Or search for the job location
            </p>

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                <input
                  type="text"
                  value={locationSearch}
                  onChange={(event) =>
                    setLocationSearch(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleSearchLocation()
                    }
                  }}
                  placeholder="Search area, street or address"
                  className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-xs text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={isSearchingLocation}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-50"
                aria-label="Search location"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {locationResults.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-lg border border-border bg-surface">
              {locationResults.map(
                (result, index) => (
                  <button
                    key={`${result.latitude}-${result.longitude}-${index}`}
                    type="button"
                    onClick={() =>
                      handleSelectLocation(
                        result
                      )
                    }
                    className="flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left last:border-b-0 hover:bg-bg"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                    <span className="text-xs leading-5 text-ink">
                      {result.label ||
                        result.address}
                    </span>
                  </button>
                )
              )}
            </div>
          )}

          {(locationError || geolocationError) && (
            <div className="mt-3 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2">
              <p className="text-[10px] leading-4 text-danger">
                {locationError ||
                  geolocationError?.message}
              </p>
            </div>
          )}

          {coords && (
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary-light px-3 py-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />

                <p className="text-xs font-semibold text-primary">
                  Job location selected
                </p>
              </div>

              <p className="mt-1 text-[10px] leading-4 text-primary/70">
                {coords.latitude.toFixed(6)},{' '}
                {coords.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* STEP 4 — BUDGET */}
      <section>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold tracking-wider text-primary">
              STEP 4
            </p>

            <span className="rounded-full bg-bg px-2 py-0.5 text-[9px] font-medium text-muted">
              Optional
            </span>
          </div>

          <h2 className="mt-0.5 text-base font-bold text-ink">
            Set your budget
          </h2>

          <p className="mt-1 text-xs text-muted">
            Give professionals an idea of what
            you're willing to spend.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
              <Wallet className="h-4 w-4 text-primary" />
            </div>

            <div>
              <p className="text-xs font-semibold text-ink">
                Your price range
              </p>

              <p className="text-[10px] text-muted">
                Professionals can still send different
                quotes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minimum (₦)"
              type="number"
              placeholder="5,000"
              value={budgetMin}
              onChange={(event) =>
                setBudgetMin(event.target.value)
              }
            />

            <Input
              label="Maximum (₦)"
              type="number"
              placeholder="15,000"
              value={budgetMax}
              onChange={(event) =>
                setBudgetMax(event.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3">
          <p className="text-xs font-medium leading-5 text-danger">
            {error.message ||
              'Could not post this job. Please try again.'}
          </p>
        </div>
      )}

      {/* SUBMIT */}
      <div className="pt-1">
        <Button
          type="submit"
          disabled={!canSubmit}
          isLoading={isSubmitting}
        >
          Post job
        </Button>

        {!coords && (
          <p className="mt-2 text-center text-[10px] leading-4 text-muted">
            Select your job location before posting
            the request.
          </p>
        )}

        {coords && (
          <p className="mt-2 text-center text-[10px] leading-4 text-muted">
            Your request will be visible to relevant
            SurePro professionals.
          </p>
        )}
      </div>
    </form>
  )
}