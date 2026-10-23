import {
  useQuery,
} from '@tanstack/react-query'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useLocationStore } from '@/store/locationStore'

import {
  fetchActiveJob,
  fetchNearbyProfessionalsRaw,
  fetchNearbyWork,
} from '../services/homeApi'

export function useHomeData() {
  const { user } = useAuth()

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

  const activeJobQuery =
    useQuery({
      queryKey: [
        'home-active-job',
        user?.id,
      ],

      queryFn: () =>
        fetchActiveJob(user.id),

      enabled: Boolean(user?.id),
    })

  const nearbyProfessionalsQuery =
    useQuery({
      queryKey: [
        'home-nearby-professionals',
        coords?.latitude ?? null,
        coords?.longitude ?? null,
      ],

      queryFn: () =>
        fetchNearbyProfessionalsRaw(
          coords,
          6
        ),

      enabled: Boolean(coords),

      staleTime: 60 * 1000,
    })

  const nearbyWorkQuery =
    useQuery({
      queryKey: [
        'home-nearby-work',
        coords?.latitude ?? null,
        coords?.longitude ?? null,
      ],

      queryFn: () =>
        fetchNearbyWork(
          coords,
          5
        ),

      enabled: Boolean(coords),

      staleTime: 60 * 1000,
    })

  return {
    activeJob:
      activeJobQuery.data ?? null,

    isActiveJobLoading:
      activeJobQuery.isLoading,

    nearbyProfessionals:
      nearbyProfessionalsQuery.data ??
      [],

    isNearbyLoading:
      nearbyProfessionalsQuery.isLoading,

    nearbyWork:
      nearbyWorkQuery.data ?? [],

    isNearbyWorkLoading:
      nearbyWorkQuery.isLoading,

    hasLocation: Boolean(coords),

    location,
  }
}