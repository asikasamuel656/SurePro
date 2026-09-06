import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProfessionals } from '../services/discoveryApi'
import { useLocationStore } from '@/store/locationStore'
import { distanceKm, formatDistance } from '@/utils/distance'

export function useNearbyProfessionals({ categoryId, searchTerm } = {}) {
  const coords = useLocationStore((s) => s.coords)

  const query = useQuery({
    queryKey: ['professionals', categoryId ?? null, searchTerm ?? null],
    queryFn: () => fetchProfessionals({ categoryId, searchTerm }),
  })

  const professionals = useMemo(() => {
    if (!query.data) return []
    const withDistance = query.data.map((p) => {
      const km =
        coords && p.latitude != null && p.longitude != null
          ? distanceKm(coords, { latitude: p.latitude, longitude: p.longitude })
          : null
      return { ...p, distanceKm: km, distanceLabel: formatDistance(km) }
    })
    if (!coords) return withDistance
    return [...withDistance].sort((a, b) => {
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
  }, [query.data, coords])

  return { ...query, professionals }
}