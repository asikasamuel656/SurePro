// routes/auth.js
const express = require('express')
const { db, admin } = require('./lib/firebaseAdmin')
const { sendOtpEmail } = require('../lib/email')
const {
  EXPIRY_MINUTES, MAX_ATTEMPTS, RESEND_COOLDOWN_SECONDS,
  generateCode, hashCode, verifyCode, normalizeEmail,
} = require('../lib/otp')

const router = express.Router()

// Generic, non-enumerating responses — never reveal whether an email
// already has an account. Firebase Auth itself will report that
// naturally at account-creation time, which is expected/normal UX,
// not an OTP-endpoint concern.
const GENERIC_SENT = { success: true, message: 'If that email is valid, a verification code has been sent.' }

router.post('/request-email-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' })
    }

    const ref = db.collection('otps').doc(email)
    const snap = await ref.get()

    if (snap.exists) {
      const data = snap.data()
      const lastSentMs = data.lastSentAt?.toMillis?.() || 0
      const secondsSinceLastSend = (Date.now() - lastSentMs) / 1000
      if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
        const waitFor = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend)
        return res.status(429).json({ success: false, message: `Please wait ${waitFor}s before requesting another code.`, retryAfterSeconds: waitFor })
      }
    }

    const code = generateCode()
    const otpHash = await hashCode(code)
    const now = admin.firestore.Timestamp.now()
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + EXPIRY_MINUTES * 60 * 1000)

    // A new code invalidates any previous one — single active OTP per email.
    await ref.set({
      otpHash, expiresAt, attempts: 0, maxAttempts: MAX_ATTEMPTS,
      createdAt: now, lastSentAt: now, verified: false, verifiedAt: null,
    })

    await sendOtpEmail(email, code)
    res.json(GENERIC_SENT)
  } catch (err) {
    console.error('request-email-otp failed:', err)
    res.status(500).json({ success: false, message: 'Something went wrong sending your code. Please try again.' })
  }
})

router.post('/verify-email-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const code = String(req.body.code || '').trim()
    if (!email || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, verified: false, message: 'Enter the 6-digit code.' })
    }

    const ref = db.collection('otps').doc(email)
    const snap = await ref.get()
    if (!snap.exists) {
      return res.status(400).json({ success: false, verified: false, message: 'That verification code is incorrect.' })
    }

    const data = snap.data()

    if (data.verified) {
      return res.json({ success: true, verified: true, message: 'Email already verified.' })
    }
    if (Date.now() > (data.expiresAt?.toMillis?.() || 0)) {
      return res.status(400).json({ success: false, verified: false, message: 'This verification code has expired. Please request a new code.' })
    }
    if (data.attempts >= data.maxAttempts) {
      return res.status(400).json({ success: false, verified: false, message: 'Too many incorrect attempts. Please request a new verification code.' })
    }

    const matches = await verifyCode(code, data.otpHash)
    if (!matches) {
      await ref.update({ attempts: admin.firestore.FieldValue.increment(1) })
      const remaining = data.maxAttempts - (data.attempts + 1)
      return res.status(400).json({
        success: false, verified: false,
        message: remaining > 0 ? 'That verification code is incorrect. Please try again.' : 'Too many incorrect attempts. Please request a new verification code.',
      })
    }

    await ref.update({ verified: true, verifiedAt: admin.firestore.Timestamp.now() })
    res.json({ success: true, verified: true, message: 'Email verified successfully.' })
  } catch (err) {
    console.error('verify-email-otp failed:', err)
    res.status(500).json({ success: false, verified: false, message: 'Something went wrong verifying your code. Please try again.' })
  }
})

module.exports = router