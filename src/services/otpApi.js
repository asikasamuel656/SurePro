// src/services/otpApi.js
const API_BASE = import.meta.env.VITE_API_BASE_URL

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed.')
    err.retryAfterSeconds = data.retryAfterSeconds
    throw err
  }
  return data
}

export function requestEmailOtp(email) {
  return post('/api/auth/request-email-otp', { email })
}

export function verifyEmailOtp(email, code) {
  return post('/api/auth/verify-email-otp', { email, code })
}