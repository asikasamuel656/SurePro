import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapPin } from 'lucide-react'

function buildIcon(color) {
  const html = renderToStaticMarkup(
    <div
      style={{
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
      }}
    >
      <MapPin size={34} fill={color} strokeWidth={1.5} color="#ffffff" />
    </div>
  )

  return L.divIcon({
    html,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    popupAnchor: [0, -30],
  })
}

const ICONS = {
  primary: buildIcon('#0e8f5d'),
  customer: buildIcon('#14171c'),
  professional: buildIcon('#0e8f5d'),
}

export function MapMarker({ position, variant = 'primary', label }) {
  if (!position) return null

  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={ICONS[variant] ?? ICONS.primary}
    >
      {label && <Popup>{label}</Popup>}
    </Marker>
  )
}