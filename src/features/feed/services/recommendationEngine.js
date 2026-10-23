import { FEED_CONFIG } from '../config/feedConfig'

/**
 * Convert degrees to radians.
 */
function toRadians(value) {
  return (value * Math.PI) / 180
}

/**
 * Calculate distance between two coordinates using the Haversine formula.
 */
export function calculateDistanceKm(
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

  const lat1 = toRadians(latitude1)
  const lat2 = toRadians(latitude2)

  const deltaLat = toRadians(latitude2 - latitude1)
  const deltaLon = toRadians(longitude2 - longitude1)

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

/**
 * Convert distance into a 0-1 recommendation score.
 *
 * Nearby professionals receive a higher score.
 */
export function calculateDistanceScore(distanceKm) {
  if (distanceKm == null) {
    return 0.5
  }

  const maxDistance = FEED_CONFIG.distance.maxDistanceKm

  if (distanceKm <= 0) return 1

  if (distanceKm >= maxDistance) return 0

  return 1 - distanceKm / maxDistance
}

/**
 * Calculate freshness using exponential decay.
 *
 * A post does not suddenly disappear when it gets old.
 */
export function calculateFreshnessScore(createdAt) {
  if (!createdAt) return 0

  const createdTime = new Date(createdAt).getTime()

  if (Number.isNaN(createdTime)) return 0

  const ageHours = Math.max(
    0,
    (Date.now() - createdTime) / (1000 * 60 * 60)
  )

  const halfLife = FEED_CONFIG.freshness.halfLifeHours

  return Math.pow(0.5, ageHours / halfLife)
}

/**
 * Normalize a number into a 0-1 range.
 *
 * Logarithmic normalization prevents extremely popular
 * posts from completely dominating the feed.
 */
export function normalizeEngagement(value, maximum = 100) {
  const safeValue = Math.max(0, Number(value) || 0)

  return Math.min(
    1,
    Math.log1p(safeValue) / Math.log1p(maximum)
  )
}

/**
 * Calculate engagement from signals currently available
 * in SurePro.
 *
 * Current signals:
 * - likes
 * - comments
 * - saves
 */
export function calculateEngagementScore(post) {
  const likes = post.likeCount ?? post.reactions?.length ?? 0

  const comments =
    post.commentCount ?? post.comments?.length ?? 0

  const saves = post.saveCount ?? 0

  const likeScore = normalizeEngagement(likes, 100)
  const commentScore = normalizeEngagement(comments, 50)
  const saveScore = normalizeEngagement(saves, 50)

  return (
    likeScore * 0.5 +
    commentScore * 0.3 +
    saveScore * 0.2
  )
}

/**
 * Calculate professional quality.
 *
 * Current signals:
 * - rating
 * - completed jobs
 * - availability
 */
export function calculateProfessionalQualityScore(
  professional
) {
  if (!professional) return 0.5

  const rating = Number(professional.rating) || 0

  const ratingScore = Math.min(1, Math.max(0, rating / 5))

  const completedJobs = Math.max(
    0,
    Number(professional.completed_jobs) || 0
  )

  const jobScore =
    Math.log1p(completedJobs) /
    Math.log1p(100)

  const availabilityScore =
    professional.is_available === false ? 0.3 : 1

  return (
    ratingScore * 0.5 +
    Math.min(1, jobScore) * 0.3 +
    availabilityScore * 0.2
  )
}

/**
 * Basic relevance score.
 *
 * If a search term exists, caption/headline/category text
 * can influence relevance.
 */
export function calculateRelevanceScore(post, context = {}) {
  const searchTerm = context.searchTerm?.trim()?.toLowerCase()

  if (!searchTerm) {
    return 0.5
  }

  const caption =
    post.caption?.toLowerCase() ?? ''

  const headline =
    post.professional?.headline?.toLowerCase() ?? ''

  const postType =
    post.post_type?.toLowerCase() ?? ''

  const matches = [
    caption,
    headline,
    postType,
  ].filter((value) =>
    value.includes(searchTerm)
  )

  if (matches.length === 0) {
    return 0.1
  }

  return Math.min(1, 0.5 + matches.length * 0.2)
}

/**
 * Content quality based on the information we currently have.
 *
 * This is intentionally conservative.
 */
export function calculateContentQualityScore(post) {
  let score = 0.4

  if (post.caption?.trim()) {
    score += 0.2
  }

  if (post.media?.length) {
    score += 0.3
  }

  if (post.post_type) {
    score += 0.1
  }

  return Math.min(1, score)
}

/**
 * Discovery score.
 *
 * Gives posts a baseline opportunity to appear even when
 * they don't have strong engagement yet.
 */
export function calculateDiscoveryScore(post) {
  if (!FEED_CONFIG.discovery.enabled) {
    return 0
  }

  const professionalCreatedAt =
    post.professional?.created_at

  if (!professionalCreatedAt) {
    return FEED_CONFIG.discovery.minimumScore
  }

  const ageDays =
    (Date.now() -
      new Date(professionalCreatedAt).getTime()) /
    (1000 * 60 * 60 * 24)

  if (ageDays <= 30) {
    return 0.8
  }

  if (ageDays <= 90) {
    return 0.5
  }

  return FEED_CONFIG.discovery.minimumScore
}

/**
 * Calculate the complete recommendation score.
 */
export function scorePost(post, context = {}) {
  const professional =
    post.professional ?? {}

  const professionalLatitude =
    professional.latitude

  const professionalLongitude =
    professional.longitude

  const userLatitude =
    context.latitude

  const userLongitude =
    context.longitude

  const distanceKm = calculateDistanceKm(
    userLatitude,
    userLongitude,
    professionalLatitude,
    professionalLongitude
  )

  const distanceScore =
    calculateDistanceScore(distanceKm)

  const relevanceScore =
    calculateRelevanceScore(post, context)

  const engagementScore =
    calculateEngagementScore(post)

  const professionalQualityScore =
    calculateProfessionalQualityScore(
      professional
    )

  const freshnessScore =
    calculateFreshnessScore(post.created_at)

  const contentQualityScore =
    calculateContentQualityScore(post)

  const discoveryScore =
    calculateDiscoveryScore(post)

  const {
    relevance,
    distance,
    engagement,
    professionalQuality,
    freshness,
    contentQuality,
    discovery,
  } = FEED_CONFIG.weights

  const score =
    relevance * relevanceScore +
    distance * distanceScore +
    engagement * engagementScore +
    professionalQuality *
      professionalQualityScore +
    freshness * freshnessScore +
    contentQuality * contentQualityScore +
    discovery * discoveryScore

  return {
    ...post,
    recommendationScore: score,
    recommendationSignals: {
      relevance: relevanceScore,
      distance: distanceScore,
      distanceKm,
      engagement: engagementScore,
      professionalQuality: professionalQualityScore,
      freshness: freshnessScore,
      contentQuality: contentQualityScore,
      discovery: discoveryScore,
    },
  }
}

/**
 * Apply diversity so one category does not dominate
 * consecutive positions.
 */
function applyDiversity(posts) {
  const result = []
  const remaining = [...posts]

  let lastCategory = null
  let consecutiveCount = 0

  while (remaining.length > 0) {
    let selectedIndex = 0

    if (
      lastCategory &&
      consecutiveCount >=
        FEED_CONFIG.diversity.maxSameCategoryInRow
    ) {
      const alternativeIndex =
        remaining.findIndex(
          (post) =>
            post.professional?.category_id !==
            lastCategory
        )

      if (alternativeIndex !== -1) {
        selectedIndex = alternativeIndex
      }
    }

    const selected = remaining.splice(
      selectedIndex,
      1
    )[0]

    const category =
      selected.professional?.category_id ?? null

    if (category === lastCategory) {
      consecutiveCount += 1
    } else {
      lastCategory = category
      consecutiveCount = 1
    }

    result.push(selected)
  }

  return result
}

/**
 * Rank the complete feed.
 */
export function rankPosts(posts = [], context = {}) {
  const scoredPosts = posts
    .map((post) => scorePost(post, context))
    .sort(
      (a, b) =>
        b.recommendationScore -
        a.recommendationScore
    )

  return applyDiversity(scoredPosts)
}