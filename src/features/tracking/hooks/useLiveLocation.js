import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchLocation, subscribeToLocation } from '../services/trackingApi'

export function useLiveLocation(jobId) {
  const [liveLocation, setLiveLocation] = useState(null)

  const query = useQuery({
    queryKey: ['tracking', jobId],
    queryFn: () => fetchLocation(jobId),
    enabled: !!jobId,
  })

  useEffect(() => {
    setLiveLocation(null)
    if (!jobId) return undefined
    const unsubscribe = subscribeToLocation(jobId, setLiveLocation)
    return unsubscribe
  }, [jobId])

  return liveLocation ?? query.data ?? null
}