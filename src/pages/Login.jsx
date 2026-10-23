// pages/login.jsx
// ─────────────────────────────────────────────────────────────
// Login — unchanged in behavior, just now backed by the real API
// (via AuthContext -> lib/api.js). One difference from before: the
// mock backend accepted any password, the real backend checks it,
// so the demo tip below now references the seeded demo password.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Input({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition
          ${error ? 'border-red-400' : 'border-gray-200'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default function Login({ onLoggedIn, onGoToRegister }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.email) errs.email = 'Required'
    if (!form.password) errs.password = 'Required'
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      const user = await login(form)
      onLoggedIn?.(user)
    } catch (err) {
      setErrors({ email: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-2xl font-bold tracking-tight mb-1">
          Sure<span className="text-emerald-600">Pro</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">Welcome back. Sign in to continue.</p>

        <form onSubmit={submit}>
          <Input label="Email address" placeholder="you@email.com" type="email" value={form.email} onChange={set('email')} error={errors.email} />
          <Input label="Password" placeholder="Your password" type="password" value={form.password} onChange={set('password')} error={errors.password} />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium text-sm py-3.5 rounded-xl transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          New to SurePro?{' '}
          <button onClick={onGoToRegister} className="text-emerald-600 hover:underline">
            Create an account
          </button>
        </p>

        <p className="text-center text-[11px] text-gray-300 mt-4">
          Demo tip: try <span className="font-medium">adewale.j@email.com</span> (provider) or{' '}
          <span className="font-medium">ngozi.kalu@email.com</span> (customer) — password <span className="font-medium">demo123</span> for both
          (run <code>npm run seed</code> in the backend first).
        </p>
      </div>
    </div>
  )
}
