import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Banknote,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/forms/ImageUploader'
import { useCategories } from '@/features/discovery/hooks/useCategories'
import { useAuth } from '@/features/auth/hooks/useAuth'

import {
  fetchOwnProfessionalRow,
  setUpProfessionalProfile,
} from '../services/profileApi'

import {
  updateProfessionalProfile,
  fetchServices,
  addService,
  deleteService,
  fetchPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
} from '@/features/professionals/services/professionalApi'

export function EditProfessionalProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: categories = [] } = useCategories()

  const {
    data: professional,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['ownProfessional', user?.id],
    queryFn: () => fetchOwnProfessionalRow(user.id),
    enabled: Boolean(user?.id),
  })

  const servicesQuery = useQuery({
    queryKey: ['ownProfessional', user?.id, 'services'],
    queryFn: () => fetchServices(user.id),
    enabled: Boolean(professional && user?.id),
  })

  const portfolioQuery = useQuery({
    queryKey: ['ownProfessional', user?.id, 'portfolio'],
    queryFn: () => fetchPortfolio(user.id),
    enabled: Boolean(professional && user?.id),
  })

  // ------------------------------------------------------------
  // Profile form
  // ------------------------------------------------------------

  const [categoryId, setCategoryId] = useState(null)
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ------------------------------------------------------------
  // Category search
  // ------------------------------------------------------------

  const [serviceQuery, setServiceQuery] = useState('')
  const [serviceSearchOpen, setServiceSearchOpen] = useState(false)

  // ------------------------------------------------------------
  // Add service
  // ------------------------------------------------------------

  const [showAddService, setShowAddService] = useState(false)
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [isAddingService, setIsAddingService] = useState(false)
  const [serviceError, setServiceError] = useState('')

  // ------------------------------------------------------------
  // Sync async professional data into form
  // ------------------------------------------------------------

  useEffect(() => {
    if (!professional) return

    setCategoryId(professional.category_id ?? null)
    setHeadline(professional.headline ?? '')
    setBio(professional.bio ?? '')
    setYearsExperience(professional.years_experience ?? '')
    setIsAvailable(professional.is_available ?? true)
  }, [professional])

  // ------------------------------------------------------------
  // Selected category
  // ------------------------------------------------------------

  const selectedCategory = categories.find(
    (category) => category.id === categoryId
  )

  const filteredCategories = useMemo(() => {
    const query = serviceQuery.trim().toLowerCase()

    if (!query) return categories

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    )
  }, [categories, serviceQuery])

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------

  const invalidateOwn = () => {
    queryClient.invalidateQueries({
      queryKey: ['ownProfessional', user?.id],
    })
  }

  const invalidateServices = () => {
    queryClient.invalidateQueries({
      queryKey: ['ownProfessional', user?.id, 'services'],
    })
  }

  const invalidatePortfolio = () => {
    queryClient.invalidateQueries({
      queryKey: ['ownProfessional', user?.id, 'portfolio'],
    })
  }

  // ------------------------------------------------------------
  // Category handlers
  // ------------------------------------------------------------

  const handleSelectCategory = (category) => {
    setCategoryId(category.id)
    setServiceQuery('')
    setServiceSearchOpen(false)
  }

  const handleClearCategory = () => {
    setCategoryId(null)
    setServiceQuery('')
    setServiceSearchOpen(false)
  }

  // ------------------------------------------------------------
  // Save profile
  // ------------------------------------------------------------

  const handleSave = async () => {
    if (!user?.id) return

    setSaveError('')
    setIsSaving(true)

    try {
      if (!professional) {
        await setUpProfessionalProfile(user.id, {
          categoryId,
          headline,
        })
      } else {
        await updateProfessionalProfile(user.id, {
          category_id: categoryId,
          headline: headline.trim(),
          bio: bio.trim(),
          years_experience: yearsExperience
            ? Number(yearsExperience)
            : null,
          is_available: isAvailable,
        })
      }

      invalidateOwn()
    } catch (error) {
      console.error('Failed to save professional profile:', error)

      setSaveError(
        error?.message ||
          'Could not save your professional profile. Please try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  // ------------------------------------------------------------
  // Services
  // ------------------------------------------------------------

  const handleAddService = async () => {
    if (!user?.id) return

    const name = newServiceName.trim()

    if (!name) {
      setServiceError('Enter a service name.')
      return
    }

    setServiceError('')
    setIsAddingService(true)

    try {
      await addService({
        professionalId: user.id,
        name,
        priceMin: newServicePrice || null,
      })

      setNewServiceName('')
      setNewServicePrice('')
      setShowAddService(false)

      invalidateServices()
    } catch (error) {
      console.error('Failed to add service:', error)

      setServiceError(
        error?.message || 'Could not add this service.'
      )
    } finally {
      setIsAddingService(false)
    }
  }

  const handleDeleteService = async (serviceId) => {
    try {
      await deleteService(serviceId)
      invalidateServices()
    } catch (error) {
      console.error('Failed to delete service:', error)

      setServiceError(
        error?.message || 'Could not remove this service.'
      )
    }
  }

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------
  // Error
  // ------------------------------------------------------------

  if (isError) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl flex-col">
          <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h1 className="text-base font-bold text-ink">
              Edit profile
            </h1>
          </header>

          <div className="flex flex-1 items-center justify-center px-5">
            <div className="text-center">
              <p className="text-sm font-semibold text-ink">
                Could not load your professional profile
              </p>

              <p className="mt-1 text-xs text-muted">
                Please try again.
              </p>

              <Button
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------
  // Main UI
  // ------------------------------------------------------------

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl flex-col">

        {/* --------------------------------------------------
            Header
        -------------------------------------------------- */}

        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-ink-soft transition hover:bg-bg"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-ink">
              {professional
                ? 'Edit professional profile'
                : 'Professional profile'}
            </h1>

            <p className="truncate text-[11px] text-muted">
              Keep your profile clear and easy to find
            </p>
          </div>
        </header>

        {/* --------------------------------------------------
            Content
        -------------------------------------------------- */}

        <main className="flex-1 overflow-y-auto px-4 py-4">

          <div className="space-y-4">

            {/* ==================================================
                PROFILE BASICS
            ================================================== */}

            <section className="rounded-2xl border border-border bg-surface p-4">

              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Profile basics
                  </h2>

                  <p className="text-[11px] text-muted">
                    Tell customers what you do
                  </p>
                </div>
              </div>

              <div className="space-y-3">

                {/* Category */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ink-soft">
                    Main service
                  </label>

                  {selectedCategory ? (
                    <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary-light px-3 py-2.5">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-lg">
                        {selectedCategory.icon || '🔧'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-primary-dark">
                          {selectedCategory.name}
                        </p>

                        <p className="text-[10px] text-muted">
                          Main service category
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleClearCategory}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary-dark transition hover:bg-white"
                        aria-label="Change service category"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div
                        className={[
                          'flex items-center gap-2 rounded-xl border bg-surface px-3.5 transition',
                          serviceSearchOpen
                            ? 'border-primary ring-2 ring-primary/10'
                            : 'border-border',
                        ].join(' ')}
                      >
                        <Search className="h-4 w-4 shrink-0 text-muted" />

                        <input
                          type="text"
                          value={serviceQuery}
                          onFocus={() => setServiceSearchOpen(true)}
                          onChange={(event) => {
                            setServiceQuery(event.target.value)
                            setServiceSearchOpen(true)
                          }}
                          placeholder="Search services..."
                          className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                        />

                        <ChevronDown
                          className={[
                            'h-4 w-4 shrink-0 text-muted transition-transform',
                            serviceSearchOpen
                              ? 'rotate-180'
                              : '',
                          ].join(' ')}
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

                          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-xl">

                            {filteredCategories.length === 0 ? (
                              <div className="px-3 py-6 text-center">
                                <Search className="mx-auto h-5 w-5 text-muted" />

                                <p className="mt-2 text-xs font-medium text-ink">
                                  No services found
                                </p>

                                <p className="mt-1 text-[10px] text-muted">
                                  Try another search
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
                                        handleSelectCategory(
                                          category
                                        )
                                      }
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-bg"
                                    >
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-lg">
                                        {category.icon || '🔧'}
                                      </div>

                                      <span className="flex-1 truncate text-sm font-medium text-ink">
                                        {category.name}
                                      </span>

                                      {category.id ===
                                        categoryId && (
                                        <Check className="h-4 w-4 text-primary" />
                                      )}
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
                </div>

                {/* Headline */}

                <Input
                  label="Headline"
                  placeholder="e.g. Licensed plumber, 8 years experience"
                  value={headline}
                  onChange={(event) =>
                    setHeadline(event.target.value)
                  }
                />

                {/* Bio */}

                {professional && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-ink-soft">
                      About you
                    </span>

                    <textarea
                      value={bio}
                      onChange={(event) =>
                        setBio(event.target.value)
                      }
                      rows={3}
                      placeholder="Tell customers about your experience and the work you provide..."
                      className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-ink outline-none placeholder:text-muted transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                )}

                {/* Experience + Availability */}

                {professional && (
                  <div className="grid grid-cols-2 gap-3">

                    <div>
                      <Input
                        label="Experience"
                        type="number"
                        min="0"
                        placeholder="Years"
                        value={yearsExperience}
                        onChange={(event) =>
                          setYearsExperience(event.target.value)
                        }
                      />
                    </div>

                    <div>
                      <span className="mb-1.5 block text-xs font-semibold text-ink-soft">
                        Availability
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setIsAvailable(!isAvailable)
                        }
                        className={[
                          'flex h-[48px] w-full items-center justify-between rounded-xl border px-3 transition',
                          isAvailable
                            ? 'border-primary bg-primary-light'
                            : 'border-border bg-surface',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={[
                              'h-2.5 w-2.5 rounded-full',
                              isAvailable
                                ? 'bg-green-500'
                                : 'bg-muted',
                            ].join(' ')}
                          />

                          <span className="text-xs font-semibold text-ink">
                            {isAvailable
                              ? 'Available'
                              : 'Unavailable'}
                          </span>
                        </div>

                        <div
                          className={[
                            'flex h-5 w-9 items-center rounded-full p-0.5 transition',
                            isAvailable
                              ? 'bg-primary justify-end'
                              : 'bg-border justify-start',
                          ].join(' ')}
                        >
                          <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Save */}

              {saveError && (
                <div className="mt-3 rounded-xl border border-danger/20 bg-danger/5 px-3 py-2.5 text-xs text-danger">
                  {saveError}
                </div>
              )}

              <Button
                className="mt-4 w-full"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!categoryId || !headline.trim()}
              >
                {professional
                  ? 'Save changes'
                  : 'Create professional profile'}
              </Button>
            </section>

            {/* ==================================================
                SERVICES
            ================================================== */}

            {professional && (
              <section className="rounded-2xl border border-border bg-surface p-4">

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-ink">
                      Services
                    </h2>

                    <p className="mt-0.5 text-[11px] text-muted">
                      What customers can hire you for
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddService(!showAddService)
                      setServiceError('')
                    }}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    {showAddService ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}

                    {showAddService ? 'Close' : 'Add'}
                  </button>
                </div>

                {/* Existing services */}

                <div className="mt-3">

                  {(servicesQuery.data ?? []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border px-4 py-5 text-center">
                      <BriefcaseBusiness className="mx-auto h-5 w-5 text-muted" />

                      <p className="mt-2 text-xs font-semibold text-ink">
                        No services added yet
                      </p>

                      <p className="mt-1 text-[10px] text-muted">
                        Add the services you want customers to see.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border rounded-xl border border-border">

                      {(servicesQuery.data ?? []).map(
                        (service) => {
                          const price =
                            service.price_min ??
                            service.priceMin

                          return (
                            <div
                              key={service.id}
                              className="flex items-center gap-3 px-3 py-3"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                                <BriefcaseBusiness className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink">
                                  {service.name}
                                </p>

                                {price !== null &&
                                  price !== undefined &&
                                  price !== '' && (
                                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
                                      <Banknote className="h-3 w-3" />

                                      From ₦
                                      {Number(price).toLocaleString()}
                                    </p>
                                  )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteService(
                                    service.id
                                  )
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-danger transition hover:bg-danger/10"
                                aria-label={`Remove ${service.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* Add service */}

                {showAddService && (
                  <div className="mt-3 rounded-xl border border-primary/20 bg-primary-light/40 p-3">

                    <p className="mb-2 text-xs font-semibold text-ink">
                      Add a service
                    </p>

                    <div className="grid grid-cols-[1fr_100px_auto] gap-2">

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />

                        <input
                          type="text"
                          value={newServiceName}
                          onChange={(event) =>
                            setNewServiceName(
                              event.target.value
                            )
                          }
                          placeholder="Service name"
                          className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-xs text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                          ₦
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={newServicePrice}
                          onChange={(event) =>
                            setNewServicePrice(
                              event.target.value
                            )
                          }
                          placeholder="Price"
                          className="h-11 w-full rounded-xl border border-border bg-surface pl-7 pr-2 text-xs text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddService}
                        disabled={isAddingService}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:opacity-90 disabled:opacity-50"
                        aria-label="Add service"
                      >
                        {isAddingService ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {serviceError && (
                      <p className="mt-2 text-[10px] text-danger">
                        {serviceError}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* ==================================================
                PORTFOLIO
            ================================================== */}

            {professional && (
              <section className="rounded-2xl border border-border bg-surface p-4">

                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-ink">
                      Portfolio
                    </h2>

                    <p className="mt-0.5 text-[11px] text-muted">
                      Show customers examples of your work
                    </p>
                  </div>

                  <span className="text-[10px] text-muted">
                    {portfolioQuery.data?.length ?? 0} photos
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">

                  {(portfolioQuery.data ?? []).map(
                    (item) => (
                      <div
                        key={item.id}
                        className="group relative aspect-square overflow-hidden rounded-xl bg-bg"
                      >
                        <img
                          src={item.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await deletePortfolioItem(
                                item.id
                              )

                              invalidatePortfolio()
                            } catch (error) {
                              console.error(
                                'Failed to delete portfolio item:',
                                error
                              )
                            }
                          }}
                          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur transition hover:bg-danger"
                          aria-label="Remove portfolio photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  )}

                  <div className="aspect-square overflow-hidden rounded-xl">
                    <ImageUploader
                      bucket="portfolios"
                      folder={user.id}
                      onUploaded={async (url) => {
                        try {
                          await addPortfolioItem({
                            professionalId: user.id,
                            imageUrl: url,
                          })

                          invalidatePortfolio()
                        } catch (error) {
                          console.error(
                            'Failed to add portfolio item:',
                            error
                          )
                        }
                      }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Bottom spacing */}

            <div className="h-4" />
          </div>
        </main>
      </div>
    </div>
  )
}