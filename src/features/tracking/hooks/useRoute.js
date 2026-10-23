import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { fetchRoute } from '../services/routingApi'

const MIN_MOVEMENT_METERS = 50
const MIN_REFRESH_INTERVAL_MS = 15000

function distanceBetweenPoints(
  first,
  second
) {
  if (!first || !second) {
    return Infinity
  }

  const earthRadiusMeters = 6371000

  const lat1 =
    (first.latitude * Math.PI) / 180
  const lat2 =
    (second.latitude * Math.PI) / 180

  const deltaLat =
    ((second.latitude - first.latitude) *
      Math.PI) /
    180

  const deltaLongitude =
    ((second.longitude - first.longitude) *
      Math.PI) /
    180

  const a =
    Math.sin(deltaLat / 2) *
      Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2)

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadiusMeters * c
}

export function useRoute({
  from,
  to,
}) {
  const [route, setRoute] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

  const lastRouteStartRef =
    useRef(null)

  const lastRouteDestinationRef =
    useRef(null)

  const lastRequestAtRef =
    useRef(0)

  useEffect(() => {
    if (!from || !to) {
      setRoute(null)
      setError(null)
      setIsLoading(false)

      lastRouteStartRef.current = null
      lastRouteDestinationRef.current = null
      lastRequestAtRef.current = 0

      return undefined
    }

    const destinationChanged =
      !lastRouteDestinationRef.current ||
      distanceBetweenPoints(
        lastRouteDestinationRef.current,
        to
      ) > 5

    const movementSinceLastRoute =
      distanceBetweenPoints(
        lastRouteStartRef.current,
        from
      )

    const timeSinceLastRequest =
      Date.now() -
      lastRequestAtRef.current

    const shouldRequestRoute =
      !lastRouteStartRef.current ||
      destinationChanged ||
      movementSinceLastRoute >=
        MIN_MOVEMENT_METERS ||
      timeSinceLastRequest >=
        MIN_REFRESH_INTERVAL_MS

    if (!shouldRequestRoute) {
      return undefined
    }

    const controller =
      new AbortController()

    const timer = setTimeout(
      async () => {
        try {
          setIsLoading(true)
          setError(null)

          const nextRoute =
            await fetchRoute({
              from,
              to,
              signal:
                controller.signal,
            })

          if (controller.signal.aborted) {
            return
          }

          setRoute(nextRoute)

          lastRouteStartRef.current = {
            latitude: from.latitude,
            longitude: from.longitude,
          }

          lastRouteDestinationRef.current = {
            latitude: to.latitude,
            longitude: to.longitude,
          }

          lastRequestAtRef.current =
            Date.now()
        } catch (routeError) {
          if (
            routeError?.name ===
            'AbortError'
          ) {
            return
          }

          console.error(
            '❌ Route request failed:',
            routeError
          )

          setError(
            routeError?.message ||
              'Unable to calculate the road route.'
          )
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false)
          }
        }
      },
      250
    )

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [
    from?.latitude,
    from?.longitude,
    to?.latitude,
    to?.longitude,
  ])

  return {
    route,
    isLoading,
    error,
  }
}