import { useState } from 'react'
import { Map } from '@/components/maps/Map'
import { MapMarker } from '@/components/maps/MapMarker'
import { Button } from '../../../components/ui/Button'

const LAGOS_FALLBACK = { latitude: 6.5244, longitude: 3.3792 }

export function LocationPickerMap({ initialCenter, onConfirm, onCancel }) {
  const [picked, setPicked] = useState(initialCenter ?? LAGOS_FALLBACK)

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden rounded-card">
        <Map center={picked} zoom={14} onMapClick={setPicked} scrollWheelZoom>
          <MapMarker position={picked} variant="primary" />
        </Map>
      </div>
      <div className="mt-4 space-y-2">
        <Button onClick={() => onConfirm(picked)}>Confirm this location</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}