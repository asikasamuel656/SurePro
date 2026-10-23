import {
  MapContainer,
  TileLayer,
  useMapEvents,
  useMap,
} from 'react-leaflet'

import { useEffect } from 'react'

import 'leaflet/dist/leaflet.css'

import { clsx } from '@/utils/clsx'

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick?.({
        latitude: e.latlng.lat,
        longitude: e.latlng.longitude,
      })
    },
  })

  return null
}

function MapSizeFix() {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)

    return () => clearTimeout(timer)
  }, [map])

  return null
}

export function Map({
  center,
  zoom = 14,
  children,
  onMapClick,
  className,
  scrollWheelZoom = false,
}) {
  if (!center) return null

  return (
    <MapContainer
      center={[
        center.latitude,
        center.longitude,
      ]}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      className={clsx(
        'h-full w-full',
        className
      )}
      style={{
        height: '100%',
        width: '100%',
        minHeight: '320px',
      }}
    >
      <MapSizeFix />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {onMapClick && (
        <ClickHandler
          onMapClick={onMapClick}
        />
      )}

      {children}
    </MapContainer>
  )
}