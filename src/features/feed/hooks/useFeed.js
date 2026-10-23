import { useQuery } from '@tanstack/react-query'

import { fetchFeed, fetchSavedPostIds } from '../services/feedApi'
import { rankPosts } from '../services/recommendationEngine'

import { useBlockedIds } from '@/features/safety/hooks/useBlocking'
import { useLocationStore } from '@/store/locationStore'

const NEARBY_RADIUS_KM = 25

function calculateDistanceKm(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  if (
    latitude1 == null ||
    longitude1 == null ||
    latitude2 == null ||
    longitude2 == null
  ) {
    return null
  }

  const earthRadiusKm = 6371

  const toRadians = (value) =>
    (value * Math.PI) / 180

  const dLatitude = toRadians(latitude2 - latitude1)
  const dLongitude = toRadians(longitude2 - longitude1)

  const a =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(dLongitude / 2) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadiusKm * c
}

function isWorkUpdate(post) {
  return ![
    'before_after',
    'promotion',
  ].includes(post.post_type)
}

function applyPostTypeFilter(posts, postType) {
  if (!postType || postType === 'all') {
    return posts
  }

  if (postType === 'work_update') {
    return posts.filter(isWorkUpdate)
  }

  return posts.filter(
    (post) => post.post_type === postType
  )
}

function applySort(posts, sortBy) {
  const sorted = [...posts]

  if (sortBy === 'most_liked') {
    return sorted.sort(
      (a, b) =>
        (b.likeCount ?? 0) -
        (a.likeCount ?? 0)
    )
  }

  return sorted.sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )
}

export function useFeed({
  professionalId,
  searchTerm,
  userId,
  nearby = false,
  postType = 'all',
  sortBy = 'recent',
} = {}) {
  const blockedIds = useBlockedIds()

  const location = useLocationStore(
    (state) => state.location
  )

  const latitude =
    location?.coords?.latitude ?? null

  const longitude =
    location?.coords?.longitude ?? null

  const hasLocation =
    latitude != null &&
    longitude != null

  /*
   * Keep this query key identical to useSavedPosts().
   * This allows both hooks to share the same React Query cache.
   */
  const savedPostsQuery = useQuery({
    queryKey: [
      'savedPosts',
      userId ?? null,
    ],

    queryFn: () =>
      fetchSavedPostIds(userId),

    enabled: Boolean(userId),

    staleTime: 30_000,
  })

  const savedPostIds =
    savedPostsQuery.data ?? []

  const query = useQuery({
    queryKey: [
      'feed',
      professionalId ?? null,
      searchTerm ?? null,
    ],

    queryFn: () =>
      fetchFeed({
        professionalId,
        searchTerm,
      }),

    staleTime: 30_000,
  })

  /*
   * Remove blocked professionals first.
   */
  const visiblePosts =
    query.data?.filter(
      (post) =>
        !blockedIds.includes(
          post.professional?.id
        )
    ) ?? []

  /*
   * Add user-specific information to every post.
   */
  const postsWithUserSignals =
    visiblePosts.map((post) => ({
      ...post,

      isSaved:
        savedPostIds.includes(post.id),
    }))

  /*
   * Existing SurePro recommendation engine.
   *
   * For You continues using this ranking system.
   */
  let processedPosts = rankPosts(
    postsWithUserSignals,
    {
      latitude,
      longitude,
      searchTerm,
    }
  )

  /*
   * Add distance from the current user to
   * each professional.
   */
  processedPosts = processedPosts.map(
    (post) => {
      const professional =
        post.professional

      const distanceKm =
        calculateDistanceKm(
          latitude,
          longitude,
          professional?.latitude,
          professional?.longitude
        )

      return {
        ...post,
        distanceKm,
      }
    }
  )

  /*
   * Nearby mode.
   *
   * If the user has no location, we don't
   * pretend that we know what is nearby.
   */
  if (nearby) {
    if (!hasLocation) {
      processedPosts = []
    } else {
      processedPosts =
        processedPosts.filter(
          (post) =>
            post.distanceKm != null &&
            post.distanceKm <=
              NEARBY_RADIUS_KM
        )
    }
  }

  /*
   * Post type filter.
   */
  processedPosts =
    applyPostTypeFilter(
      processedPosts,
      postType
    )

  /*
   * Sorting.
   */
  processedPosts =
    applySort(
      processedPosts,
      sortBy
    )

  return {
    ...query,

    data: processedPosts,

    isLoading:
      query.isLoading ||
      savedPostsQuery.isLoading,

    location: {
      latitude,
      longitude,
      hasLocation,
    },

    nearbyRadiusKm:
      NEARBY_RADIUS_KM,
  }
}