import {
  Map,
} from '@/components/maps/Map'

import {
  MapMarker,
} from '@/components/maps/MapMarker'

import {
  RoadRoute,
} from './RoadRoute'

export function TrackingMap({
  professionalPosition,
  destination,
  route,
  isRouteLoading,
  routeError,
}) {
  const center =
    professionalPosition ??
    destination

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-card">
      <Map
        center={center}
        zoom={14}
        scrollWheelZoom
      >
        {destination && (
          <MapMarker
            position={destination}
            variant="customer"
            label="Customer destination"
          />
        )}

        {professionalPosition && (
          <MapMarker
            position={
              professionalPosition
            }
            variant="professional"
            label="Professional"
          />
        )}

        <RoadRoute
          route={route}
          professionalPosition={
            professionalPosition
          }
          destination={destination}
        />
      </Map>

      {isRouteLoading && (
        <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-full bg-surface/95 px-3 py-2 text-xs font-semibold text-ink shadow">
          Updating route…
        </div>
      )}

      {!isRouteLoading &&
        !route &&
        !routeError &&
        professionalPosition &&
        destination && (
          <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-full bg-surface/95 px-3 py-2 text-xs font-medium text-muted shadow">
            Calculating road route…
          </div>
        )}

      {routeError && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[1000] rounded-control bg-surface/95 px-3 py-2 text-center text-xs font-medium text-muted shadow">
          Road route is temporarily unavailable.
        </div>
      )}
    </div>
  )
}