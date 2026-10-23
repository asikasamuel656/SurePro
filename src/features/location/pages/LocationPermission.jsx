import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPinned,
  MapPin,
} from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { useGeolocation } from '../hooks/useGeolocation'
import { reverseGeocode } from '../services/geocoding'
import { useLocationStore } from '@/store/locationStore'
import { LocationPickerMap } from '../components/LocationPickerMap'
import { ROUTES } from '@/constants/routes'

export function LocationPermission() {
  const navigate = useNavigate()

  const {
    requestLocation,
    isLocating,
    error,
  } = useGeolocation()

  const setLocation = useLocationStore(
    (state) => state.setLocation
  )

  const savedLocation = useLocationStore(
    (state) => state.location
  )

  const [pickingOnMap, setPickingOnMap] =
    useState(false)

  const [resolving, setResolving] =
    useState(false)

  const finishWithCoords = async (
    coords,
    permissionStatus
  ) => {
    if (
      coords?.latitude == null ||
      coords?.longitude == null
    ) {
      return
    }

    setResolving(true)

    try {
      const location =
        await reverseGeocode(coords)

      setLocation({
        coords,

        address:
          location.address,

        city:
          location.city,

        state:
          location.state,

        country:
          location.country,

        postcode:
          location.postcode,

        permissionStatus,
      })

      navigate(ROUTES.HOME)
    } catch {
      setLocation({
        coords,

        address:
          'Selected location',

        city: null,
        state: null,
        country: null,
        postcode: null,

        permissionStatus,
      })

      navigate(ROUTES.HOME)
    } finally {
      setResolving(false)
    }
  }

  const handleUseCurrentLocation =
    async () => {
      try {
        const coords =
          await requestLocation()

        await finishWithCoords(
          coords,
          'granted'
        )
      } catch {
        // Error is already displayed.
      }
    }

  const handleSkip = () => {
    setLocation({
      coords: null,
      address: null,
      city: null,
      state: null,
      country: null,
      postcode: null,
      permissionStatus: 'denied',
    })

    navigate(ROUTES.HOME)
  }

  const initialCenter =
    savedLocation?.latitude != null &&
    savedLocation?.longitude != null
      ? {
          latitude:
            savedLocation.latitude,
          longitude:
            savedLocation.longitude,
        }
      : null

  if (pickingOnMap) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell flex min-h-dvh flex-col px-6 py-6">
          <h1 className="mb-4 text-xl font-bold text-ink">
            Choose your location
          </h1>

          <div className="flex-1">
            <LocationPickerMap
              initialCenter={initialCenter}
              onConfirm={(coords) =>
                finishWithCoords(
                  coords,
                  'manual'
                )
              }
              onCancel={() =>
                setPickingOnMap(false)
              }
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col items-center justify-between px-6 py-10 text-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary">
            <MapPinned className="h-9 w-9" />
          </span>

          <div>
            <h1 className="text-2xl font-bold text-ink">
              Allow SurePro to access your location
            </h1>

            <p className="mt-2 max-w-xs text-sm text-muted">
              This helps us show professionals near you and share accurate job locations.
              You can change this anytime.
            </p>
          </div>

          {error && (
            <p className="text-sm text-danger">
              {error.message}
            </p>
          )}
        </div>

        <div className="w-full space-y-3">
          <Button
            onClick={
              handleUseCurrentLocation
            }
            isLoading={
              isLocating || resolving
            }
            icon={MapPinned}
          >
            Use Current Location
          </Button>

          <Button
            variant="secondary"
            icon={MapPin}
            onClick={() =>
              setPickingOnMap(true)
            }
          >
            Choose on Map
          </Button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-2 text-sm font-medium text-muted"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}