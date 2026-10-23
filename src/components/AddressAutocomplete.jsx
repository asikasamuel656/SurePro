// src/components/AddressAutocomplete.jsx
// ─────────────────────────────────────────────────────────────
// Address input backed by Google Places Autocomplete, with a map
// preview that updates when a suggestion is selected. Deliberately
// does NOT let the user continue on free-typed text — onSelect only
// fires when they pick an actual suggestion, and the parent step
// should keep its "Continue" button disabled until it has fired once.
//
// Uses the classic `google.maps.places.Autocomplete` widget (via
// @googlemaps/js-api-loader) rather than the newer PlaceAutocompleteElement
// web component — Google still fully supports and documents this API,
// it just has broader browser/React compatibility and far more existing
// examples than the newer element, which is still maturing. Worth
// revisiting if Google formally deprecates it down the line.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

let loaderPromise = null
function loadGoogleMaps() {
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    })
    loaderPromise = loader.load()
  }
  return loaderPromise
}

function extractComponent(components, type) {
  const match = components.find((c) => c.types.includes(type))
  return match?.long_name || ''
}

export default function AddressAutocomplete({ value, onSelect, error }) {
  const inputRef = useRef(null)
  const mapDivRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState(value || null)

  useEffect(() => {
    let autocomplete
    let cancelled = false

    loadGoogleMaps()
      .then((google) => {
        if (cancelled) return

        autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry', 'address_components', 'place_id'],
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (!place.geometry) {
            // user hit Enter on free-typed text with no suggestion selected
            setSelected(null)
            return
          }
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const components = place.address_components || []
          const result = {
            address: place.formatted_address,
            latitude: lat,
            longitude: lng,
            placeId: place.place_id,
            city: extractComponent(components, 'locality') || extractComponent(components, 'postal_town'),
            state: extractComponent(components, 'administrative_area_level_1'),
            country: extractComponent(components, 'country'),
            postalCode: extractComponent(components, 'postal_code'),
          }
          setSelected(result)
          onSelect(result)

          if (!mapRef.current) {
            mapRef.current = new google.maps.Map(mapDivRef.current, {
              center: { lat, lng },
              zoom: 15,
              disableDefaultUI: true,
              zoomControl: true,
            })
          } else {
            mapRef.current.setCenter({ lat, lng })
          }
          if (markerRef.current) markerRef.current.setMap(null)
          markerRef.current = new google.maps.Marker({ position: { lat, lng }, map: mapRef.current })
        })
      })
      .catch((err) => {
        console.error('Google Maps failed to load:', err)
        setLoadError("We couldn't load the address search. Please check your connection and try again.")
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm your location</label>
      <p className="text-xs text-gray-400 mb-2">Select your address from the suggestions so we can accurately locate you.</p>

      <input
        ref={inputRef}
        type="text"
        defaultValue={value?.address || ''}
        placeholder="Start typing your address…"
        onChange={() => setSelected(null)} // typing without re-selecting invalidates the prior selection
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition ${error ? 'border-red-400' : 'border-gray-200'}`}
      />

      {loadError && <p className="text-xs text-red-500 mt-1">{loadError}</p>}
      {error && !loadError && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!error && !selected && !loadError && (
        <p className="text-xs text-gray-400 mt-1">Please select your address from the suggested locations.</p>
      )}

      <div
        ref={mapDivRef}
        className={`w-full rounded-xl mt-3 bg-gray-100 transition-all ${selected ? 'h-48 opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}
      />
    </div>
  )
}