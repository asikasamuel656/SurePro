// Uses OpenStreetMap's free Nominatim API for reverse geocoding, keeping
// SurePro's maps stack entirely Google-free per product decision #12.
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

export async function reverseGeocode({ latitude, longitude }) {
  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Could not resolve that location.')
  const data = await response.json()
  const address = data.address ?? {}
  return (
    address.suburb ||
    address.neighbourhood ||
    address.city_district ||
    address.city ||
    address.town ||
    data.display_name ||
    'Selected location'
  )
}

export async function searchPlace(query) {
  const url = `${NOMINATIM_BASE}/search?format=jsonv2&q=${encodeURIComponent(
    query
  )}&countrycodes=ng&limit=6`
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Search failed.')
  const results = await response.json()
  return results.map((r) => ({
    label: r.display_name,
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
  }))
}