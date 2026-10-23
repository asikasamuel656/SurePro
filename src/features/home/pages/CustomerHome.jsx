import { useNavigate } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  Bell,
  MapPin,
  Heart,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'

import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useHomeData } from '../hooks/useHomeData'
import { useCategories } from '@/features/discovery/hooks/useCategories'
import { useLocationStore } from '@/store/locationStore'
import { LocationPrompt } from '@/features/location/components/LocationPrompt'
import { ROUTES } from '@/constants/routes'

export function CustomerHome() {
  const navigate = useNavigate()

  const { profile } = useAuth()

  const {
    nearbyProfessionals,
    isNearbyLoading,
    nearbyWork,
    isNearbyWorkLoading,
  } = useHomeData()

  const { notifications } =
    useNotifications()

  const {
    data: categories = [],
  } = useCategories()

  /*
   * Get the user's saved location.
   *
   * This comes from the global location store,
   * so the location selected from the location
   * permission page is available here.
   */
  const location = useLocationStore(
    (state) => state.location
  )

  const permissionStatus =
    useLocationStore(
      (state) => state.permissionStatus
    )

  /*
   * Work out what should be displayed
   * beside "Serving:".
   */
  const locationLabel =
    location?.city ||
    location?.state ||
    'Set your location'

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length

  return (
    <CustomerLayout>
      {/* =========================
          TOP HEADER
      ========================== */}

      <div className="flex items-center justify-between bg-surface px-5 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Profile */}
          <img
            src={
              profile?.avatar_url ||
              '/placeholder-avatar.jpg'
            }
            alt="Profile"
            className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
          />

          {/* Location */}
          <button
            type="button"
            onClick={() =>
              navigate(
                ROUTES.LOCATION_PERMISSION
              )
            }
            className="flex min-w-0 items-center gap-1 text-left text-xs text-muted"
          >
            <span className="shrink-0">
              Serving:
            </span>

            <span className="truncate font-semibold text-ink">
              {locationLabel}
            </span>

            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink" />
          </button>
        </div>

        {/* Notifications */}
        <button
          type="button"
          onClick={() =>
            navigate(
              ROUTES.NOTIFICATIONS
            )
          }
          className="relative shrink-0 rounded-full border border-border bg-surface p-2 text-ink-soft"
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* =========================
          LOCATION PROMPT
      ========================== */}

      <LocationPrompt />

      {/* =========================
          SEARCH & FILTER
      ========================== */}

      <div className="flex items-center gap-2 bg-surface px-5 pb-4">
        <button
          type="button"
          onClick={() =>
            navigate(ROUTES.DISCOVER)
          }
          className="flex flex-1 items-center gap-2.5 rounded-xl border border-border bg-bg px-4 py-3 text-left text-sm text-muted"
        >
          <Search className="h-4 w-4 text-muted" />

          What do you need help with?
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(ROUTES.DISCOVER)
          }
          aria-label="Filters"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* =========================
          CATEGORIES
      ========================== */}

      {categories.length > 0 && (
        <div className="px-5 py-3">
          <div className="grid grid-cols-6 gap-2 text-center">
            {categories
              .slice(0, 6)
              .map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `${ROUTES.DISCOVER}?category=${cat.id}`
                    )
                  }
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <img
                      src={
                        cat.icon_url ||
                        '/icons/default.svg'
                      }
                      alt={cat.name}
                      className="h-6 w-6"
                    />
                  </div>

                  <span className="w-full truncate text-[11px] font-medium text-ink">
                    {cat.name}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* =========================
          MAIN CONTENT
      ========================== */}

      <div className="space-y-6 pb-24 pt-2">
        {/* =========================
            WORK HAPPENING NEAR YOU
        ========================== */}

        <section className="px-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">
              Work happening near you
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate(ROUTES.FEED)
              }
              className="text-xs font-semibold text-emerald-600"
            >
              See all
            </button>
          </div>

          <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">
            {isNearbyWorkLoading ? (
              [0, 1].map((i) => (
                <div
                  key={i}
                  className="h-56 w-64 shrink-0 animate-pulse rounded-2xl bg-muted/20"
                />
              ))
            ) : nearbyWork.length === 0 ? (
              <div className="rounded-xl border border-border bg-bg px-4 py-4">
                <p className="text-sm text-muted">
                  {permissionStatus ===
                  'unset'
                    ? 'Set your location to see work happening near you.'
                    : 'No recent work nearby yet.'}
                </p>
              </div>
            ) : (
              nearbyWork.map((post) => (
                <div
                  key={post.id}
                  onClick={() =>
                    navigate(
                      `/work/${post.id}`
                    )
                  }
                  className="w-64 shrink-0 cursor-pointer rounded-2xl border border-border bg-surface p-2.5 shadow-sm"
                >
                  <div className="relative mb-2 grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
                    <span className="absolute left-2 top-2 z-10 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {post.post_type ||
                        'Work'}
                    </span>

                    <div className="relative h-28">
                      <img
                        src={
                          post.media?.[0]
                            ?.media_url ||
                          '/placeholder-work.jpg'
                        }
                        alt="Work"
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
                        Work
                      </span>
                    </div>

                    <div className="relative h-28">
                      <img
                        src={
                          post.media?.[1]
                            ?.media_url ||
                          post.media?.[0]
                            ?.media_url ||
                          '/placeholder-work.jpg'
                        }
                        alt="Work"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate text-xs font-bold text-ink">
                        {post.caption ||
                          'Completed work'}
                      </h3>

                      <p className="text-[11px] text-muted">
                        {post.professional
                          ?.profile
                          ?.full_name ||
                          'Professional'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Heart className="h-3.5 w-3.5 text-danger" />

                      <span>
                        {post.likeCount ||
                          0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2">
                    <img
                      src={
                        post.professional
                          ?.profile
                          ?.avatar_url ||
                        '/placeholder-avatar.jpg'
                      }
                      alt=""
                      className="h-4 w-4 rounded-full object-cover"
                    />

                    <span className="truncate text-[10px] font-medium text-muted">
                      By{' '}
                      {post.professional
                        ?.profile
                        ?.full_name ||
                        'Professional'}
                    </span>

                    <CheckCircle2 className="h-3 w-3 shrink-0 fill-emerald-600/20 text-emerald-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* =========================
            PROFESSIONALS NEAR YOU
        ========================== */}

        <section className="px-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">
                Top verified professionals
                near you
              </h2>

              {location?.city && (
                <p className="mt-0.5 text-[10px] text-muted">
                  Near {location.city}
                  {location.state
                    ? `, ${location.state}`
                    : ''}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(ROUTES.DISCOVER)
              }
              className="text-xs font-semibold text-emerald-600"
            >
              View all
            </button>
          </div>

          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
            {/* Loading */}
            {isNearbyLoading ? (
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-44 w-32 shrink-0 animate-pulse rounded-2xl bg-muted/20"
                />
              ))
            ) : nearbyProfessionals.length ===
              0 ? (
              <div className="rounded-xl border border-border bg-bg px-4 py-4">
                <p className="text-sm text-muted">
                  {permissionStatus ===
                  'unset'
                    ? 'Set your location to see professionals near you.'
                    : 'No professionals found nearby yet.'}
                </p>

                {permissionStatus !==
                  'unset' && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        ROUTES.DISCOVER
                      )
                    }
                    className="mt-2 text-xs font-semibold text-primary"
                  >
                    Explore all
                    professionals
                  </button>
                )}
              </div>
            ) : (
              nearbyProfessionals.map(
                (pro) => (
                  <div
                    key={pro.id}
                    onClick={() =>
                      navigate(
                        `/professionals/${pro.id}`
                      )
                    }
                    className="w-36 shrink-0 cursor-pointer rounded-2xl border border-border bg-surface p-2.5 text-center shadow-sm"
                  >
                    {/* Professional Image */}
                    <div className="relative mx-auto mb-2 h-20 w-full overflow-hidden rounded-xl">
                      <img
                        src={
                          pro.avatar_url ||
                          '/placeholder-avatar.jpg'
                        }
                        alt={
                          pro.full_name ||
                          'Professional'
                        }
                        className="h-full w-full object-cover"
                      />

                      {/* Rating */}
                      <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-ink shadow-sm">
                        ★{' '}
                        {pro.rating !=
                        null
                          ? Number(
                              pro.rating
                            ).toFixed(
                              1
                            )
                          : 'New'}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="flex items-center justify-center gap-1">
                      <h3 className="truncate text-xs font-bold text-ink">
                        {pro.full_name ||
                          'Professional'}
                      </h3>

                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 fill-emerald-600/20 text-emerald-600" />
                    </div>

                    {/* Category */}
                    <p className="truncate text-[10px] text-muted">
                      {pro.category_name ||
                        'General Service'}
                    </p>

                    {/* Distance */}
                    <p className="mt-1 flex items-center justify-center gap-0.5 text-[10px] font-medium text-muted">
                      <MapPin className="h-2.5 w-2.5" />

                      {pro.distanceKm !=
                      null
                        ? `${Number(
                            pro.distanceKm
                          ).toFixed(
                            1
                          )} km away`
                        : 'Distance unavailable'}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </section>
      </div>

      {/* =========================
          BOTTOM NAVIGATION
      ========================== */}

      <BottomNavigation />
    </CustomerLayout>
  )
}