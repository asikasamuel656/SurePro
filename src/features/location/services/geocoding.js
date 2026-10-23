const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

async function requestNominatim(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Could not resolve that location.')
  }

  return response.json()
}

export async function reverseGeocode({
  latitude,
  longitude,
}) {
  if (
    latitude == null ||
    longitude == null
  ) {
    throw new Error('Latitude and longitude are required.')
  }

  const url =
    `${NOMINATIM_BASE}/reverse` +
    `?format=jsonv2` +
    `&lat=${encodeURIComponent(latitude)}` +
    `&lon=${encodeURIComponent(longitude)}` +
    `&addressdetails=1`

  const data = await requestNominatim(url)

  const address = data.address ?? {}

  return {
    latitude,
    longitude,

    address:
      data.display_name ||
      [
        address.house_number,
        address.road,
        address.suburb,
        address.city,
        address.state,
      ]
        .filter(Boolean)
        .join(', ') ||
      'Selected location',

    city:
      address.city ||
      address.town ||
      address.municipality ||
      address.city_district ||
      null,

    state:
      address.state ||
      null,

    country:
      address.country ||
      null,

    postcode:
      address.postcode ||
      null,
  }
}

export async function searchPlace(query) {
  if (!query?.trim()) {
    return []
  }

  const url =
    `${NOMINATIM_BASE}/search` +
    `?format=jsonv2` +
    `&q=${encodeURIComponent(query)}` +
    `&countrycodes=ng` +
    `&addressdetails=1` +
    `&limit=6`

  const results = await requestNominatim(url)

  return results.map((result) => ({
    label: result.display_name,

    latitude: Number(result.lat),

    longitude: Number(result.lon),

    address:
      result.display_name,

    city:
      result.address?.city ||
      result.address?.town ||
      result.address?.municipality ||
      result.address?.city_district ||
      null,

    state:
      result.address?.state ||
      null,

    country:
      result.address?.country ||
      null,

    postcode:
      result.address?.postcode ||
      null,
  }))
}