// pages/role_selection.jsx
import { useState } from 'react'

export default function RoleSelection({ onSelectRole }) {
  const [loading, setLoading] = useState(null)

  async function selectRole(role) {
    setLoading(role)
    try {
      onSelectRole?.(role)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Sure<span className="text-emerald-600">Pro</span>
          </h1>
          <p className="text-sm text-gray-500">Choose how you want to use SurePro</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => selectRole('customer')}
            disabled={loading === 'customer'}
            className="group relative border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
          >
            <div className="text-4xl mb-3">🏠</div>
            <h2 className="text-lg font-semibold mb-1 group-hover:text-emerald-700">I need a service</h2>
            <p className="text-sm text-gray-500 mb-3">Find verified pros for home services</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✓ Post jobs & submit requests</li>
              <li>✓ Track job status</li>
              <li>✓ Follow providers & see their feed</li>
            </ul>
            {loading === 'customer' && (
              <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-sm text-gray-500">Loading…</span>
              </div>
            )}
          </button>

          <button
            onClick={() => selectRole('provider')}
            disabled={loading === 'provider'}
            className="group relative border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
          >
            <div className="text-4xl mb-3">🛠️</div>
            <h2 className="text-lg font-semibold mb-1 group-hover:text-emerald-700">I offer a service</h2>
            <p className="text-sm text-gray-500 mb-3">Get matched to local jobs</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✓ Build your profile & portfolio</li>
              <li>✓ Receive job requests</li>
              <li>✓ Post updates to your feed</li>
            </ul>
            {loading === 'provider' && (
              <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-sm text-gray-500">Loading…</span>
              </div>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <button onClick={() => onSelectRole?.('login')} className="text-emerald-600 hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  )
}