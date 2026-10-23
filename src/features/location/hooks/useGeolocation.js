import { useCallback, useState } from 'react'

export function useGeolocation() {
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState(null)

  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const err = new Error(
          'Geolocation is not supported on this device.'
        )

        setError(err)
        reject(err)
        return
      }

      setIsLocating(true)
      setError(null)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false)

          const {
            latitude,
            longitude,
            accuracy,
          } = position.coords

          resolve({
            latitude,
            longitude,
            accuracy,
          })
        },

        (geoError) => {
          setIsLocating(false)

          let message =
            'Could not detect your location. Try again or choose your location manually.'

          if (
            geoError.code ===
            geoError.PERMISSION_DENIED
          ) {
            message =
              'Location permission was denied. You can still choose your area manually.'
          }

          if (
            geoError.code ===
            geoError.POSITION_UNAVAILABLE
          ) {
            message =
              'Your current location could not be determined. Check your device location settings and try again.'
          }

          if (
            geoError.code ===
            geoError.TIMEOUT
          ) {
            message =
              'Location detection took too long. Please try again.'
          }

          const err = new Error(message)

          setError(err)
          reject(err)
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        }
      )
    })
  }, [])

  return {
    requestLocation,
    isLocating,
    error,
  }
}