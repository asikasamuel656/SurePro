import { useState } from 'react'
import { Map } from '@/components/maps/Map'
import { MapMarker } from '@/components/maps/MapMarker'
import { Button } from '../../../components/ui/Button'

const NIGERIA_CENTER = {
  latitude: 9.082,
  longitude: 8.6753,
}

export function LocationPickerMap({
  initialCenter,
  onConfirm,
  onCancel,
}) {
  const [picked, setPicked] = useState(
    initialCenter ?? NIGERIA_CENTER
  )

  const hasInitialLocation = Boolean(
    initialCenter?.latitude != null &&
      initialCenter?.longitude != null
  )

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden rounded-card">
        <Map
          center={picked}
          zoom={hasInitialLocation ? 14 : 6}
          onMapClick={setPicked}
          scrollWheelZoom
        >
          <MapMarker
            position={picked}
            variant="primary"
          />
        </Map>
      </div>

      <div className="mt-4 space-y-2">
        <Button
          onClick={() => onConfirm(picked)}
        >
          Confirm this location
        </Button>

        <Button
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}