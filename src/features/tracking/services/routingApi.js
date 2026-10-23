const ROUTING_BASE_URL =
  'https://router.project-osrm.org/route/v1/driving'

export async function fetchRoute({
  from,
  to,
  signal,
}) {
  if (!from || !to) {
    throw new Error(
      'Both route start and destination are required.'
    )
  }

  const coordinates = [
    `${from.longitude},${from.latitude}`,
    `${to.longitude},${to.latitude}`,
  ].join(';')

  const params = new URLSearchParams({
    alternatives: 'false',
    steps: 'false',
    overview: 'full',
    geometries: 'geojson',
  })

  const url = `${ROUTING_BASE_URL}/${coordinates}?${params.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    signal,
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Routing service returned ${response.status}.`
    )
  }

  const data = await response.json()

  if (data.code !== 'Ok') {
    throw new Error(
      data.message ||
        `No route could be found (${data.code}).`
    )
  }

  const route = data.routes?.[0]

  if (!route) {
    throw new Error(
      'No route was returned for these locations.'
    )
  }

  const geometry =
    route.geometry?.coordinates ?? []

  const coordinatesLatLng = geometry
    .filter(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length >= 2
    )
    .map(([longitude, latitude]) => [
      latitude,
      longitude,
    ])

  if (coordinatesLatLng.length < 2) {
    throw new Error(
      'The routing service returned an invalid route.'
    )
  }

  return {
    coordinates: coordinatesLatLng,
    distanceMeters:
      Number(route.distance) || 0,
    durationSeconds:
      Number(route.duration) || 0,
  }
}