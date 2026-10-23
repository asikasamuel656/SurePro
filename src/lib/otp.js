// lib/otp.js
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const OTP_LENGTH = 6
const EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_SECONDS = 60

// crypto.randomInt is a CSPRNG (unlike Math.random) — this is the
// "cryptographically secure random 6-digit code" requirement.
function generateCode() {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0')
}

async function hashCode(code) {
  return bcrypt.hash(code, 10)
}

async function verifyCode(code, hash) {
  return bcrypt.compare(code, hash)
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

module.exports = {
  OTP_LENGTH,
  EXPIRY_MINUTES,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
  generateCode,
  hashCode,
  verifyCode,
  normalizeEmail,
}