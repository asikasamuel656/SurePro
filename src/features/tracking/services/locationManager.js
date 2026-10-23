import {
  upsertLocation,
  stopSharingLocation,
} from './trackingApi'

const MIN_UPDATE_INTERVAL_MS = 5000
const STORAGE_KEY = 'surepro_active_location_share'

let watchId = null
let lastSentAt = 0
let activeSession = null

const listeners = new Set()

function notify() {
  const snapshot = {
    isSharing: Boolean(activeSession),
    jobId: activeSession?.jobId ?? null,
    professionalId: activeSession?.professionalId ?? null,
  }

  listeners.forEach((listener) => {
    listener(snapshot)
  })
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(session)
  )
}

function loadSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    return stored ? JSON.parse(stored) : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

async function sendPosition(position) {
  if (!activeSession) {
    console.warn('⚠️ GPS position received but no active session.')
    return
  }

  const now = Date.now()

  if (
    now - lastSentAt <
    MIN_UPDATE_INTERVAL_MS
  ) {
    return
  }

  lastSentAt = now

  const latitude = position.coords.latitude
  const longitude = position.coords.longitude
  const heading = position.coords.heading ?? null

  console.log('📍 GPS position received:', {
    latitude,
    longitude,
    heading,
    jobId: activeSession.jobId,
    professionalId: activeSession.professionalId,
  })

  try {
    await upsertLocation({
      jobId: activeSession.jobId,
      professionalId: activeSession.professionalId,
      latitude,
      longitude,
      heading,
    })

    console.log('✅ Location saved to Supabase')
  } catch (error) {
    console.error(
      '❌ Could not save location to Supabase:',
      error
    )
  }
}

function handlePositionError(error) {
  console.error('❌ Browser GPS error:', {
    code: error.code,
    message: error.message,
  })

  if (error.code === 1) {
    console.error(
      'Location permission was denied.'
    )
  }

  if (error.code === 2) {
    console.error(
      'Location position is unavailable.'
    )
  }

  if (error.code === 3) {
    console.error(
      'Location request timed out.'
    )
  }
}

function beginWatch() {
  if (watchId !== null) {
    console.log('📍 GPS watcher already running:', watchId)
    return
  }

  if (!navigator.geolocation) {
    console.error(
      '❌ Geolocation is not supported by this browser.'
    )
    return
  }

  console.log('📍 Starting browser GPS watcher...')

  watchId = navigator.geolocation.watchPosition(
    sendPosition,
    handlePositionError,
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    }
  )

  console.log(
    '✅ GPS watcher started:',
    watchId
  )
}

export function startLocationSharing({
  jobId,
  professionalId,
}) {
  console.log('🚀 Starting location sharing:', {
    jobId,
    professionalId,
  })

  if (!jobId) {
    throw new Error('Missing job ID.')
  }

  if (!professionalId) {
    throw new Error('Missing professional ID.')
  }

  if (!navigator.geolocation) {
    throw new Error(
      'Geolocation is not supported by this browser.'
    )
  }

  activeSession = {
    jobId,
    professionalId,
  }

  lastSentAt = 0

  saveSession(activeSession)

  beginWatch()

  notify()
}

export async function stopLocationSharing() {
  const session = activeSession

  console.log(
    '🛑 Stopping location sharing:',
    session
  )

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)

    console.log(
      '🛑 GPS watcher stopped:',
      watchId
    )

    watchId = null
  }

  activeSession = null
  lastSentAt = 0

  saveSession(null)

  notify()

  if (session?.jobId) {
    try {
      await stopSharingLocation(
        session.jobId
      )

      console.log(
        '✅ Tracking row removed from Supabase'
      )
    } catch (error) {
      console.error(
        '❌ Could not remove tracking row:',
        error
      )
    }
  }
}

export function getLocationSharingState() {
  if (!activeSession) {
    const stored = loadSession()

    if (
      stored?.jobId &&
      stored?.professionalId
    ) {
      activeSession = stored
    }
  }

  return {
    isSharing: Boolean(activeSession),
    jobId: activeSession?.jobId ?? null,
    professionalId:
      activeSession?.professionalId ?? null,
  }
}

export function subscribeToLocationSharing(
  listener
) {
  listeners.add(listener)

  listener(
    getLocationSharingState()
  )

  return () => {
    listeners.delete(listener)
  }
}

export function restoreLocationSharing() {
  const session = loadSession()

  if (
    !session?.jobId ||
    !session?.professionalId
  ) {
    return
  }

  console.log(
    '🔄 Restoring location sharing:',
    session
  )

  activeSession = session

  beginWatch()

  notify()
}