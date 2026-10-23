import {
  Polyline,
  useMap,
} from 'react-leaflet'

import {
  useEffect,
  useMemo,
} from 'react'

import L from 'leaflet'

function RouteViewport({
  coordinates,
  professionalPosition,
  destination,
}) {
  const map = useMap()

  const bounds = useMemo(() => {
    const points = []

    if (
      professionalPosition?.latitude != null &&
      professionalPosition?.longitude != null
    ) {
      points.push([
        professionalPosition.latitude,
        professionalPosition.longitude,
      ])
    }

    if (
      destination?.latitude != null &&
      destination?.longitude != null
    ) {
      points.push([
        destination.latitude,
        destination.longitude,
      ])
    }

    if (coordinates?.length) {
      points.push(...coordinates)
    }

    if (points.length < 2) {
      return null
    }

    return L.latLngBounds(points)
  }, [
    coordinates,
    professionalPosition,
    destination,
  ])

  useEffect(() => {
    if (!bounds) {
      return
    }

    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 15,
      animate: true,
      duration: 0.5,
    })
  }, [bounds, map])

  return null
}

export function RoadRoute({
  route,
  professionalPosition,
  destination,
}) {
  if (
    !route?.coordinates ||
    route.coordinates.length < 2
  ) {
    return null
  }

  return (
    <>
      <RouteViewport
        coordinates={route.coordinates}
        professionalPosition={
          professionalPosition
        }
        destination={destination}
      />

      <Polyline
        positions={route.coordinates}
        pathOptions={{
          color: '#0e8f5d',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      <Polyline
        positions={route.coordinates}
        pathOptions={{
          color: '#ffffff',
          weight: 2,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </>
  )
}