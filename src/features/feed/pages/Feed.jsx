import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Plus,
  SlidersHorizontal,
  Sparkles,
  X,
  Check,
  MapPin,
} from 'lucide-react'

import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { PostCard } from '@/components/cards/PostCard'

import { useFeed } from '../hooks/useFeed'
import { useLike } from '../hooks/useLike'
import { useSavedPosts } from '../hooks/useSavedPosts'
import { useAuth } from '@/features/auth/hooks/useAuth'

import { professionalProfilePath } from '@/constants/routes'
import { ACCOUNT_TYPES } from '@/constants/accountTypes'

export function Feed() {
  const navigate = useNavigate()

  const { user, profile } =
    useAuth()

  /*
   * Main feed state.
   */
  const [feedMode, setFeedMode] =
    useState('for_you')

  const [showFilters, setShowFilters] =
    useState(false)

  const [postType, setPostType] =
    useState('all')

  const [sortBy, setSortBy] =
    useState('recent')

  const {
    data: posts = [],
    isLoading,
    isError,
    location,
    nearbyRadiusKm,
  } = useFeed({
    userId: user?.id,

    nearby:
      feedMode === 'nearby',

    postType,

    sortBy,
  })

  const likeMutation =
    useLike()

  const {
    isSaved,
    toggle: toggleSave,
    isSaving,
  } = useSavedPosts()

  const isProfessional =
    profile?.account_type ===
    ACCOUNT_TYPES.PROFESSIONAL

  const handleShare = async (post) => {
    const url =
      `${window.location.origin}` +
      `${professionalProfilePath(
        post.professional?.id
      )}`

    if (navigator.share) {
      try {
        await navigator.share({
          title:
            'Check this out on SurePro',
          url,
        })
      } catch {
        // User cancelled share.
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          url
        )
      } catch {
        console.error(
          'Could not copy share link.'
        )
      }
    }
  }

  const handleLike = (post) => {
    likeMutation.mutate({
      postId: post.id,

      hasReacted:
        post.reactions?.some(
          (reaction) =>
            reaction.user_id ===
            user?.id
        ),
    })
  }

  const handleFeedModeChange = (
    mode
  ) => {
    setFeedMode(mode)
  }

  const resetFilters = () => {
    setPostType('all')
    setSortBy('recent')
  }

  const activeFilterCount =
    (postType !== 'all' ? 1 : 0) +
    (sortBy !== 'recent' ? 1 : 0)

  return (
    <CustomerLayout>
      <div className="flex min-h-0 flex-1 flex-col">

        {/* HEADER */}
        <header className="relative shrink-0 border-b border-border bg-surface px-5 pb-4 pt-5">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-[11px] font-medium text-primary">
                SUREPRO COMMUNITY
              </p>

              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink">
                Work Feed
              </h1>

              <p className="mt-1 text-xs text-muted">
                Discover work from professionals around you.
              </p>
            </div>

            {isProfessional && (
              <button
                type="button"
                onClick={() =>
                  navigate('/feed/create')
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition hover:opacity-90"
                aria-label="Create post"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* FEED MODE + FILTER */}
          <div className="mt-4 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  handleFeedModeChange(
                    'for_you'
                  )
                }
                className={
                  feedMode === 'for_you'
                    ? 'rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-white'
                    : 'rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-ink-soft'
                }
              >
                For you
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFeedModeChange(
                    'nearby'
                  )
                }
                className={
                  feedMode === 'nearby'
                    ? 'flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-white'
                    : 'flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-ink-soft'
                }
              >
                <MapPin className="h-3 w-3" />

                Nearby
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (current) =>
                    !current
                )
              }
              className={
                showFilters ||
                activeFilterCount > 0
                  ? 'relative flex items-center gap-1.5 rounded-lg border border-primary bg-primary-light px-3 py-1.5 text-[11px] font-semibold text-primary'
                  : 'flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-ink-soft'
              }
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />

              Filter

              {activeFilterCount >
                0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* FILTER PANEL */}
          {showFilters && (
            <div className="mt-3 rounded-2xl border border-border bg-bg p-4 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-semibold text-ink">
                    Filter feed
                  </p>

                  <p className="mt-0.5 text-[11px] text-muted">
                    Choose what you want to see.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(
                      false
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4 text-muted" />
                </button>
              </div>

              {/* POST TYPE */}
              <div className="mt-4">

                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Post type
                </p>

                <div className="grid grid-cols-2 gap-2">

                  {[
                    {
                      value: 'all',
                      label: 'All posts',
                    },
                    {
                      value: 'work_update',
                      label: 'Work updates',
                    },
                    {
                      value: 'before_after',
                      label: 'Before & after',
                    },
                    {
                      value: 'promotion',
                      label: 'Promotions',
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setPostType(
                          option.value
                        )
                      }
                      className={
                        postType ===
                        option.value
                          ? 'flex items-center justify-between rounded-xl border border-primary bg-primary-light px-3 py-2.5 text-left text-xs font-semibold text-primary'
                          : 'flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-xs font-medium text-ink-soft'
                      }
                    >
                      <span>
                        {option.label}
                      </span>

                      {postType ===
                        option.value && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* SORT */}
              <div className="mt-4">

                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Sort by
                </p>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setSortBy(
                        'recent'
                      )
                    }
                    className={
                      sortBy === 'recent'
                        ? 'rounded-full bg-primary px-3 py-2 text-[11px] font-semibold text-white'
                        : 'rounded-full border border-border bg-surface px-3 py-2 text-[11px] font-medium text-ink-soft'
                    }
                  >
                    Most recent
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSortBy(
                        'most_liked'
                      )
                    }
                    className={
                      sortBy ===
                      'most_liked'
                        ? 'rounded-full bg-primary px-3 py-2 text-[11px] font-semibold text-white'
                        : 'rounded-full border border-border bg-surface px-3 py-2 text-[11px] font-medium text-ink-soft'
                    }
                  >
                    Most liked
                  </button>
                </div>
              </div>

              {/* RESET */}
              {activeFilterCount >
                0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 w-full rounded-xl border border-border bg-surface py-2.5 text-xs font-semibold text-ink-soft transition hover:bg-bg"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* NEARBY LOCATION INFO */}
          {feedMode ===
            'nearby' && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary-light px-3 py-2">

              <MapPin className="h-4 w-4 shrink-0 text-primary" />

              <p className="text-[11px] leading-4 text-primary">
                {location.hasLocation
                  ? `Showing professionals within ${nearbyRadiusKm} km of your location.`
                  : 'Set your location to discover nearby professionals.'}
              </p>
            </div>
          )}
        </header>

        {/* SCROLLABLE FEED */}
        <main className="min-h-0 flex-1 overflow-y-auto pb-28">

          {/* LOADING */}
          {isLoading && (
            <div className="space-y-3 px-5 pt-4">

              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-2xl border border-border bg-surface"
                  >
                    <div className="h-12 animate-pulse bg-bg" />

                    <div className="aspect-[4/3] animate-pulse bg-bg" />

                    <div className="space-y-2 p-4">

                      <div className="h-3 w-3/4 animate-pulse rounded bg-bg" />

                      <div className="h-3 w-1/2 animate-pulse rounded bg-bg" />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ERROR */}
          {isError && (
            <div className="mx-5 mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-5">

              <p className="text-sm font-semibold text-danger">
                Couldn't load the feed
              </p>

              <p className="mt-1 text-xs leading-5 text-danger/80">
                Please check your connection and try again.
              </p>
            </div>
          )}

          {/* NO LOCATION */}
          {!isLoading &&
            !isError &&
            feedMode ===
              'nearby' &&
            !location.hasLocation && (
              <div className="flex min-h-[50vh] flex-col items-center justify-center px-8 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>

                <h2 className="mt-4 text-base font-semibold text-ink">
                  Location needed
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-5 text-muted">
                  Turn on your location or choose your location so SurePro can show professionals near you.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/location'
                    )
                  }
                  className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Set my location
                </button>
              </div>
            )}

          {/* EMPTY */}
          {!isLoading &&
            !isError &&
            location.hasLocation !==
              false &&
            posts.length === 0 && (
              <div className="flex min-h-[55vh] flex-col items-center justify-center px-8 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>

                <h2 className="mt-4 text-base font-semibold text-ink">
                  Nothing here yet
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-5 text-muted">
                  {feedMode ===
                  'nearby'
                    ? 'There are no posts from professionals within your nearby area yet.'
                    : 'Once professionals start sharing their work, you will see it here.'}
                </p>

                {activeFilterCount >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="mt-5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-ink-soft"
                  >
                    Clear filters
                  </button>
                )}

                {isProfessional &&
                  activeFilterCount ===
                    0 && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          '/feed/create'
                        )
                      }
                      className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Share your work
                    </button>
                  )}
              </div>
            )}

          {/* POSTS */}
          {!isLoading &&
            !isError &&
            posts.length > 0 && (
              <div className="space-y-3 px-5 pt-4">

                {posts.map(
                  (post) => {
                    const hasLiked =
                      post.reactions?.some(
                        (reaction) =>
                          reaction.user_id ===
                          user?.id
                      )

                    return (
                      <PostCard
                        key={post.id}
                        post={post}
                        hasLiked={
                          hasLiked
                        }
                        isSaved={isSaved(
                          post.id
                        )}
                        onLike={() =>
                          handleLike(
                            post
                          )
                        }
                        onComment={() =>
                          navigate(
                            `/feed/${post.id}`
                          )
                        }
                        onSave={() =>
                          toggleSave(
                            post.id
                          )
                        }
                        onShare={() =>
                          handleShare(
                            post
                          )
                        }
                        onProfileClick={() =>
                          navigate(
                            professionalProfilePath(
                              post
                                .professional
                                ?.id
                            )
                          )
                        }
                      />
                    )
                  }
                )}
              </div>
            )}
        </main>

        <BottomNavigation />
      </div>
    </CustomerLayout>
  )
}