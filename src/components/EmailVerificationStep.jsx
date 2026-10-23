// src/components/EmailVerificationStep.jsx
import { useState, useEffect, useRef } from 'react'
import OtpBoxInput from './OtpBoxInput'
import { requestEmailOtp, verifyEmailOtp } from '../services/otpApi'

const RESEND_COOLDOWN_SECONDS = 60

function maskEmail(email) {
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name.slice(0, 1)}${'*'.repeat(Math.max(name.length - 1, 1))}@${domain}`
}

export default function EmailVerificationStep({ onVerified, onBack }) {
  const [stage, setStage] = useState('email') // 'email' | 'sending' | 'otp' | 'verifying' | 'verified'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (cooldown <= 0) return
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [cooldown])

  async function sendCode(targetEmail) {
    setError('')
    setStage('sending')
    try {
      await requestEmailOtp(targetEmail)
      setStage('otp')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.message || 'Could not send the verification code. Please try again.')
      setStage('email')
    }
  }

  function submitEmail(e) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address.')
    sendCode(email.trim().toLowerCase())
  }

  async function submitCode(code) {
    setError('')
    setStage('verifying')
    try {
      const result = await verifyEmailOtp(email, code)
      if (result.verified) {
        setStage('verified')
        setTimeout(() => onVerified(email), 700)
      }
    } catch (err) {
      setError(err.message || 'That verification code is incorrect. Please try again.')
      setStage('otp')
      setResetKey((k) => k + 1)
    }
  }

  function resend() {
    if (cooldown > 0) return
    sendCode(email)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Verify your email</h2>

      {stage === 'email' || stage === 'sending' ? (
        <>
          <p className="text-sm text-gray-500 mb-6">We'll send a 6-digit code to confirm it's really you.</p>
          <form onSubmit={submitEmail}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition ${error ? 'border-red-400' : 'border-gray-200'}`}
                disabled={stage === 'sending'}
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <div className="flex gap-3">
              {onBack && (
                <button type="button" onClick={onBack} className="w-1/3 border border-gray-200 text-gray-700 font-medium text-sm py-3.5 rounded-xl">Back</button>
              )}
              <button type="submit" disabled={stage === 'sending'} className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium text-sm py-3.5 rounded-xl transition-colors">
                {stage === 'sending' ? 'Sending verification code…' : 'Continue →'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-1">We sent a 6-digit code to</p>
          <p className="text-sm font-medium text-gray-900 mb-6">{maskEmail(email)}</p>

          {stage === 'verified' ? (
            <div className="flex items-center gap-2 justify-center py-6 text-emerald-700 font-medium text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">✓</span>
              Email verified successfully
            </div>
          ) : (
            <>
              <OtpBoxInput onComplete={submitCode} disabled={stage === 'verifying'} resetKey={resetKey} />
              {stage === 'verifying' && <p className="text-xs text-gray-400 text-center mt-3">Verifying…</p>}
              {error && <p className="text-xs text-red-500 text-center mt-3">{error}</p>}

              <div className="text-center mt-5">
                {cooldown > 0 ? (
                  <p className="text-xs text-gray-400">Resend code in {cooldown}s</p>
                ) : (
                  <button onClick={resend} className="text-xs text-emerald-600 font-medium hover:underline">Resend code</button>
                )}
              </div>
              <button onClick={() => setStage('email')} className="block mx-auto text-xs text-gray-400 hover:text-gray-600 mt-3">
                Use a different email
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}