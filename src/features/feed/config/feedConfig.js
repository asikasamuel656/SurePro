export const FEED_CONFIG = {
  weights: {
    relevance: 0.30,
    distance: 0.20,
    engagement: 0.15,
    professionalQuality: 0.10,
    freshness: 0.05,
    contentQuality: 0.05,
    discovery: 0.05,
  },

  freshness: {
    halfLifeHours: 72,
  },

  distance: {
    maxDistanceKm: 50,
  },

  diversity: {
    maxSameCategoryInRow: 3,
    categoryPenalty: 0.15,
  },

  discovery: {
    enabled: true,
    minimumScore: 0.15,
  },
}