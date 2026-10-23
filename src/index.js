// index.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const authRoutes = require('./routes/auth')

const app = express()
app.use(express.json())

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
app.use(cors({
  origin(origin, callback) {
    // allow no-origin requests (curl, server-to-server health checks)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
}))

// Backend-enforced rate limiting — IN ADDITION to the per-email cooldown/
// attempt limits in routes/auth.js, this caps requests per IP so someone
// can't hammer the endpoint using many different emails.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per IP per window across both OTP endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})
app.use('/api/auth', otpLimiter, authRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 4001
app.listen(PORT, () => console.log(`SurePro OTP server listening on port ${PORT}`))