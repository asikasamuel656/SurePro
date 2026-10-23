import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  getLocationSharingState,
  startLocationSharing,
  stopLocationSharing,
  subscribeToLocationSharing,
} from '../services/locationManager'

export function useLocationBroadcast({
  jobId,
  professionalId,
}) {
  const [
    state,
    setState,
  ] = useState(() =>
    getLocationSharingState()
  )

  const [error, setError] =
    useState(null)

  useEffect(() => {
    return subscribeToLocationSharing(
      setState
    )
  }, [])

  const start = useCallback(() => {
    try {
      setError(null)

      startLocationSharing({
        jobId,
        professionalId,
      })
    } catch (error) {
      console.error(
        '❌ Could not start location sharing:',
        error
      )

      setError(
        error.message ||
          'Could not start location sharing.'
      )
    }
  }, [jobId, professionalId])

  const stop = useCallback(async () => {
    setError(null)

    try {
      await stopLocationSharing()
    } catch (error) {
      console.error(
        '❌ Could not stop location sharing:',
        error
      )

      setError(
        error.message ||
          'Could not stop location sharing.'
      )
    }
  }, [])

  const isSharing =
    state.isSharing &&
    state.jobId === jobId &&
    state.professionalId === professionalId

  return {
    isSharing,
    start,
    stop,
    error,
  }
}