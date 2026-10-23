import {
  useQuery,
} from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { useLocationStore } from '@/store/locationStore'
import { distanceKm } from '@/utils/distance'

export function useNearbyProfessionals({
  categoryId = null,
  searchTerm = '',
  limit = 50,
} = {}) {
  const location =
    useLocationStore(
      (state) => state.location
    )

  const coords =
    location?.latitude != null &&
    location?.longitude != null
      ? {
          latitude:
            Number(location.latitude),

          longitude:
            Number(location.longitude),
        }
      : null

  const query = useQuery({
    queryKey: [
      'discover-professionals',
      categoryId,
      searchTerm,
      coords?.latitude ?? null,
      coords?.longitude ?? null,
    ],

    queryFn: async () => {
      let request =
        supabase
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
              id,
              name,
              icon
            ),
            profile:profiles!professionals_id_fkey (
              id,
              full_name,
              avatar_url,
              phone
            )
          `)
          .eq(
            'is_available',
            true
          )
          .limit(100)

      if (categoryId) {
        request =
          request.eq(
            'category_id',
            categoryId
          )
      }

      const {
        data,
        error,
      } = await request

      if (error) {
        throw error
      }

      let professionals =
        (data ?? []).map(
          (professional) => {
            const professionalCoords =
              professional.latitude != null &&
              professional.longitude != null

            const customerCoords =
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
                professionalCoords &&
                customerCoords
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

      const normalizedSearch =
        searchTerm
          ?.trim()
          .toLowerCase()

      if (normalizedSearch) {
        professionals =
          professionals.filter(
            (professional) => {
              const name =
                professional.full_name
                  ?.toLowerCase() ?? ''

              const headline =
                professional.headline
                  ?.toLowerCase() ?? ''

              const category =
                professional.category_name
                  ?.toLowerCase() ?? ''

              return (
                name.includes(
                  normalizedSearch
                ) ||
                headline.includes(
                  normalizedSearch
                ) ||
                category.includes(
                  normalizedSearch
                )
              )
            }
          )
      }

      // With location:
      // nearest professionals first.
      if (coords) {
        professionals.sort(
          (a, b) =>
            (a.distanceKm ??
              Infinity) -
            (b.distanceKm ??
              Infinity)
        )
      } else {
        // Without location:
        // use rating as the fallback
        // instead of pretending results
        // are nearby.
        professionals.sort(
          (a, b) =>
            (b.rating ?? 0) -
            (a.rating ?? 0)
        )
      }

      return professionals.slice(
        0,
        limit
      )
    },

    staleTime: 60 * 1000,
  })

  return {
    professionals:
      query.data ?? [],

    isLoading:
      query.isLoading,

    isError:
      query.isError,

    error:
      query.error,

    hasLocation:
      Boolean(coords),

    location,
  }
}