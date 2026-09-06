import { useCallback, useState } from 'react'

/**
 * Thin wrapper around the Browser Geolocation API. Never called
 * automatically — SurePro only asks for location when the person taps
 * "Use current location", never on page load or during registration.
 */
export function useGeolocation() {
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState(null)

  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const err = new Error('Geolocation is not supported on this device.')
        setError(err)
        reject(err)
        return
      }

      setIsLocating(true)
      setError(null)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (geoError) => {
          setIsLocating(false)
          const message =
            geoError.code === geoError.PERMISSION_DENIED
              ? 'Location permission was denied. You can still set your area manually.'
              : 'Could not detect your location. Try again or set it manually.'
          const err = new Error(message)
          setError(err)
          reject(err)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    })
  }, [])

  return { requestLocation, isLocating, error }
}