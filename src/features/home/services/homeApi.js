import { supabase } from '@/lib/supabase'
import { distanceKm } from '@/utils/distance'

export async function fetchActiveJob(
  customerId
) {
  const { data, error } =
    await supabase
      .from('jobs')
      .select(`
        id,
        title,
        status,
        created_at,
        professional:professionals (
          id,
          profile:profiles!professionals_id_fkey (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('customer_id', customerId)
      .not(
        'status',
        'in',
        '(completed,cancelled)'
      )
      .order('created_at', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function fetchNearbyProfessionalsRaw(
  coords,
  limit = 6
) {
  console.log(
    '🔎 Fetching professionals from Supabase...'
  )

  const { data, error } =
    await supabase
      .from('professionals')
      .select(`
        id,
        headline,
        rating,
        completed_jobs,
        is_available,
        latitude,
        longitude,
        category:categories (
          name
        ),
        profile:profiles!professionals_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('is_available', true)
      .limit(100)

  console.log(
    '👨‍🔧 Professionals data:',
    data
  )

  console.log(
    '❌ Professionals error:',
    JSON.stringify(
      error,
      null,
      2
    )
  )

  if (error) {
    throw error
  }

  const professionals = data ?? []

  const withDistance =
    professionals.map(
      (professional) => {
        const hasProfessionalCoords =
          professional.latitude != null &&
          professional.longitude != null

        const hasCustomerCoords =
          coords?.latitude != null &&
          coords?.longitude != null

        return {
          ...professional,

          full_name:
            professional.profile
              ?.full_name ?? null,

          avatar_url:
            professional.profile
              ?.avatar_url ?? null,

          category_name:
            professional.category
              ?.name ?? null,

          distanceKm:
            hasCustomerCoords &&
            hasProfessionalCoords
              ? distanceKm(
                  coords,
                  {
                    latitude:
                      Number(
                        professional.latitude
                      ),

                    longitude:
                      Number(
                        professional.longitude
                      ),
                  }
                )
              : null,
        }
      }
    )

  // When the user has no location,
  // return professionals without pretending
  // they are nearby.
  if (
    !coords?.latitude ||
    !coords?.longitude
  ) {
    return withDistance
      .slice(0, limit)
  }

  return withDistance
    .filter(
      (professional) =>
        professional.distanceKm != null
    )
    .sort(
      (a, b) =>
        (a.distanceKm ?? Infinity) -
        (b.distanceKm ?? Infinity)
    )
    .slice(0, limit)
}

export async function fetchRecommendedProfessionals(
  coords,
  limit = 6
) {
  const nearby =
    await fetchNearbyProfessionalsRaw(
      coords,
      50
    )

  return [...nearby]
    .sort(
      (a, b) =>
        (b.rating ?? 0) -
        (a.rating ?? 0)
    )
    .slice(0, limit)
}

export async function fetchNearbyWork(
  coords,
  limit = 5
) {
  const { data, error } =
    await supabase
      .from('posts')
      .select(`
        id,
        caption,
        created_at,
        professional:professionals (
          id,
          latitude,
          longitude,
          profile:profiles!professionals_id_fkey (
            full_name,
            avatar_url
          )
        ),
        media:post_media (
          media_url,
          sort_order
        ),
        reactions (
          user_id
        ),
        comments (
          id
        )
      `)
      .order('created_at', {
        ascending: false,
      })
      .limit(50)

  if (error) {
    throw error
  }

  const posts = data ?? []

  const withDistance =
    posts.map((post) => ({
      ...post,

      media: [
        ...(post.media ?? []),
      ].sort(
        (a, b) =>
          (a.sort_order ?? 0) -
          (b.sort_order ?? 0)
      ),

      likeCount:
        post.reactions?.length ?? 0,

      commentCount:
        post.comments?.length ?? 0,

      distanceKm:
        coords &&
        post.professional
          ?.latitude != null &&
        post.professional
          ?.longitude != null
          ? distanceKm(
              coords,
              {
                latitude:
                  Number(
                    post.professional
                      .latitude
                  ),

                longitude:
                  Number(
                    post.professional
                      .longitude
                  ),
              }
            )
          : null,
    }))

  if (
    !coords?.latitude ||
    !coords?.longitude
  ) {
    return withDistance.slice(
      0,
      limit
    )
  }

  return withDistance
    .filter(
      (post) =>
        post.distanceKm != null
    )
    .sort(
      (a, b) =>
        (a.distanceKm ?? Infinity) -
        (b.distanceKm ?? Infinity)
    )
    .slice(0, limit)
}