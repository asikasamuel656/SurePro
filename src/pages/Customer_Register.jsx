// pages/customer_register.jsx
// ─────────────────────────────────────────────────────────────
// CHANGED: added an email OTP verification step BEFORE account
// creation (was: Account -> Profile; now: Verify email -> Account ->
// Profile). Everything else keeps your existing structure —
// registerStep1/completeProfile from AuthContext, shared
// Input/Btn/StepBar/StepProfile from form_kit.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Input, Btn, StepBar, StepProfile } from '../components/form_kit'
import EmailVerificationStep from '../components/EmailVerificationStep'

function StepAccount({ verifiedEmail, onNext, onBack }) {
  const { registerStep1 } = useAuth()

  const [form, setForm] = useState({ password: '', fullName: '', phone: '', address: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: null }))
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.fullName) errs.fullName = 'Full name is required'
    if (!form.phone) errs.phone = 'Phone number is required'
    if (!form.password || form.password.length < 6) errs.password = 'Min 6 characters'

    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      const user = await registerStep1({ role: 'customer', email: verifiedEmail, ...form })
      onNext(user)
    } catch (err) {
      let message = err.message
      if (err.code === 'auth/email-already-in-use') message = 'This email address is already registered.'
      else if (err.code === 'auth/weak-password') message = 'Password should be at least 6 characters.'
      setErrors({ password: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="text-xl font-semibold mb-1">Create your account</h2>
      <p className="text-sm text-gray-500 mb-6">
        Verified as <span className="font-medium text-gray-700">{verifiedEmail}</span>
      </p>

      <Input label="Full name" placeholder="Ngozi Kalu" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
      <Input label="Phone number" placeholder="+234 80..." type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
      <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} error={errors.password} />
      <Input label="Address / area" placeholder="e.g. Ajah, Lagos State" value={form.address} onChange={set('address')} />

      {errors.general && <p className="text-xs text-red-500 font-medium mb-3">{errors.general}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={loading} className="w-1/3 border border-gray-200 text-gray-700 font-medium text-sm py-3.5 rounded-xl disabled:opacity-50">Back</button>
        <div className="w-2/3"><Btn loading={loading}>Continue →</Btn></div>
      </div>
    </form>
  )
}

export default function CustomerRegister({ onRegistered, onGoToLogin }) {
  const { completeProfile } = useAuth()
  const [step, setStep] = useState(1) // 1: email OTP, 2: account, 3: profile
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [tempUser, setTempUser] = useState(null)

  function handleEmailVerified(email) {
    setVerifiedEmail(email)
    setStep(2)
  }

  function handleAccountDone(createdUserData) {
    setTempUser(createdUserData)
    setStep(3)
  }

  async function handleProfileSubmit({ avatarFile, bio }) {
    const user = await completeProfile(tempUser, { avatarFile, bio })
    onRegistered?.(user)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-2xl font-bold tracking-tight mb-1">
          Sure<span className="text-emerald-600">Pro</span>
          <span className="ml-2 text-xs font-normal text-gray-400">customer registration</span>
        </div>

        <StepBar current={step} total={3} />

        {step === 1 && <EmailVerificationStep onVerified={handleEmailVerified} />}
        {step === 2 && <StepAccount verifiedEmail={verifiedEmail} onNext={handleAccountDone} onBack={() => setStep(1)} />}
        {step === 3 && (
          <StepProfile
            title="Your profile"
            subtitle="Providers will see this when you post a request."
            onSubmit={handleProfileSubmit}
            onSkip={() => handleProfileSubmit({ avatarFile: null, bio: '' })}
          />
        )}

        {step === 1 && (
          <p className="text-center text-xs text-gray-400 mt-5">
            Already have an account?{' '}
            <button onClick={onGoToLogin} className="text-emerald-600 hover:underline">Sign in</button>
          </p>
        )}
      </div>
    </div>
  )
}