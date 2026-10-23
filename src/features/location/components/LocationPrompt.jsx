import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  ChevronRight,
} from 'lucide-react'

import { useLocationStore } from '@/store/locationStore'
import { ROUTES } from '@/constants/routes'

export function LocationPrompt({
  message = 'Set your location to see professionals near you',
}) {
  const navigate = useNavigate()

  const permissionStatus =
    useLocationStore(
      (state) => state.permissionStatus
    )

  const location =
    useLocationStore(
      (state) => state.location
    )

  const hasCoordinates =
    location?.latitude != null &&
    location?.longitude != null

  if (
    permissionStatus !== 'unset' ||
    hasCoordinates
  ) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() =>
        navigate(
          ROUTES.LOCATION_PERMISSION
        )
      }
      className="mx-6 mb-2 flex w-[calc(100%-3rem)] items-center justify-between rounded-control bg-primary-light px-4 py-3 text-left"
    >
      <span className="flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-primary" />

        <span className="text-sm font-medium text-primary">
          {message}
        </span>
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
    </button>
  )
}