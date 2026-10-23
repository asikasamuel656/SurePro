// request.jsx
// ─────────────────────────────────────────────────────────────
// Customer: submit a service request + view their request history
// Fully self-contained React — no Next.js, no Supabase
// Replace the mock data / api stubs below with your real calls
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'

// ── mock data ─────────────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: 'c1', icon: '⚡', name: 'Electricians' },
  { id: 'c2', icon: '💧', name: 'Plumbers' },
  { id: 'c3', icon: '🏠', name: 'Cleaners' },
  { id: 'c4', icon: '🎨', name: 'Painters' },
  { id: 'c5', icon: '❄️', name: 'AC Technicians' },
  { id: 'c6', icon: '🪚', name: 'Carpenters' },
]

const MOCK_REQUESTS = [
  {
    id: 'r1',
    title: 'Power trip in living room',
    status: 'assigned',
    address: '14B Admiralty Way, Lekki Phase 1',
    categories: { icon: '⚡', name: 'Electricians' },
    providers: { profiles: { full_name: 'Emeka Adeyemi', phone: '+234 803 111 2233' } },
    created_at: '2025-04-12T09:00:00Z',
    updates: [
      { id: 'u1', message: 'Emeka is on his way to your location.', photo_url: null, profiles: { full_name: 'Emeka Adeyemi' }, created_at: '2025-04-12T09:30:00Z' },
    ],
  },
]

// ── swap these stubs with your real API / Supabase calls ──────
const api = {
  getCategories: async () => ({ data: MOCK_CATEGORIES }),

  createRequest: async (payload) => ({
    data: {
      id: 'r' + Date.now(),
      title: payload.title,
      status: 'pending',
      address: payload.address,
      categories: MOCK_CATEGORIES.find(c => c.id === payload.category_id),
      providers: null,
      created_at: new Date().toISOString(),
      updates: [],
    },
  }),

  getMyRequests: async (userId) => ({ data: MOCK_REQUESTS }),

  getJobUpdates: async (requestId) => ({
    data: MOCK_REQUESTS.find(r => r.id === requestId)?.updates || [],
  }),

  // For real file upload: send FormData to your backend / Supabase storage
  uploadFile: async (file) => URL.createObjectURL(file),
}

// ── status helpers ────────────────────────────────────────────
const STATUS_LABEL = {
  pending:     { text: 'Waiting for provider', color: 'bg-gray-100 text-gray-600' },
  assigned:    { text: 'Provider assigned',     color: 'bg-blue-100 text-blue-700' },
  en_route:    { text: 'En route',              color: 'bg-amber-100 text-amber-700' },
  in_progress: { text: 'In progress',           color: 'bg-violet-100 text-violet-700' },
  completed:   { text: 'Completed ✓',           color: 'bg-emerald-100 text-emerald-700' },
  cancelled:   { text: 'Cancelled',             color: 'bg-red-100 text-red-600' },
}

function StatusBadge({ status }) {
  const s = STATUS_LABEL[status] || STATUS_LABEL.pending
  return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.color}`}>{s.text}</span>
}

// ── new request form ──────────────────────────────────────────
function NewRequestForm({ categories, onSubmitted }) {
  const [form, setForm]       = useState({ category_id: '', title: '', description: '', address: '', is_urgent: false })
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function pickImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.category_id) errs.category_id = 'Choose a service'
    if (!form.title)        errs.title       = 'Describe the job briefly'
    if (!form.address)      errs.address     = 'We need your address'
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      let image_url = null
      if (image) image_url = await api.uploadFile(image)
      const { data, error } = await api.createRequest({ ...form, image_url })
      if (error) throw new Error(error)
      onSubmitted(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-1">Request a service</h2>
      <p className="text-sm text-gray-500 mb-6">Describe the job and we'll find a verified pro near you.</p>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Service type</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(c => {
            const on = form.category_id === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, category_id: c.id }))}
                className={`flex flex-col items-center gap-1.5 border rounded-xl p-3 text-xs font-medium transition-all
                  ${on ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
              >
                <span className="text-xl">{c.icon}</span>
                {c.name}
              </button>
            )
          })}
        </div>
        {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">What needs fixing?</label>
        <input
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
          placeholder="e.g. Power trip in living room"
          value={form.title}
          onChange={set('title')}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          More details <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          placeholder="Describe the problem in more detail…"
          value={form.description}
          onChange={set('description')}
        />
      </div>

      {/* Image */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Photo of the problem <span className="text-gray-400">(optional)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer border border-dashed border-gray-200 rounded-xl p-3 hover:border-emerald-400 transition-colors">
          {preview
            ? <img src={preview} alt="" className="w-14 h-14 rounded-lg object-cover" />
            : <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-2xl">📷</div>}
          <span className="text-sm text-emerald-600 font-medium">{preview ? 'Change photo' : 'Add a photo'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={pickImage} />
        </label>
      </div>

      {/* Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your address</label>
        <input
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
          placeholder="e.g. 14B Admiralty Way, Lekki Phase 1"
          value={form.address}
          onChange={set('address')}
        />
        {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
      </div>

      {/* Urgent toggle */}
      <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => setForm(f => ({ ...f, is_urgent: !f.is_urgent }))}>
        <div className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${form.is_urgent ? 'bg-amber-500' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_urgent ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <div>
          <p className="text-sm font-medium">This is urgent</p>
          <p className="text-xs text-gray-400">Faster matching — premium rates may apply</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium text-sm py-3.5 rounded-xl transition-colors"
      >
        {loading ? 'Submitting…' : 'Submit request →'}
      </button>
    </form>
  )
}

// ── request card ──────────────────────────────────────────────
function RequestCard({ req }) {
  const [expanded, setExpanded] = useState(false)
  const [updates, setUpdates]   = useState([])

  async function toggleUpdates() {
    if (expanded) { setExpanded(false); return }
    const { data } = await api.getJobUpdates(req.id)
    setUpdates(data || [])
    setExpanded(true)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium">{req.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{req.categories?.icon} {req.categories?.name} · {req.address}</p>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {req.providers && (
        <div className="flex items-center gap-2 mt-3 p-2.5 bg-gray-50 rounded-xl">
          <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-sm">👤</div>
          <div>
            <p className="text-xs font-medium">{req.providers.profiles?.full_name}</p>
            <p className="text-xs text-gray-400">{req.providers.profiles?.phone}</p>
          </div>
        </div>
      )}

      <button onClick={toggleUpdates} className="text-xs text-emerald-600 hover:text-emerald-800 mt-3 font-medium">
        {expanded ? '▲ Hide updates' : '▼ View updates'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {updates.length === 0
            ? <p className="text-xs text-gray-400">No updates yet.</p>
            : updates.map(u => (
              <div key={u.id} className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-700">{u.message}</p>
                  {u.photo_url && <img src={u.photo_url} alt="" className="w-24 h-16 rounded-lg object-cover mt-1.5" />}
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {u.profiles?.full_name} · {new Date(u.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      <p className="text-[11px] text-gray-300 mt-3">
        Submitted {new Date(req.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────
// Props:
//   user     — { id, ... } — pass your auth user object
//   onLogin  — () => void — called when unauthenticated; redirect to login
export default function RequestPage({ user, onLogin }) {
  const [categories, setCategories] = useState([])
  const [requests, setRequests]     = useState([])
  const [view, setView]             = useState('new')
  const [submitted, setSubmitted]   = useState(null)

  useEffect(() => {
    if (!user && onLogin) onLogin()
  }, [user, onLogin])

  useEffect(() => {
    api.getCategories().then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    if (user && view === 'history') {
      api.getMyRequests(user.id).then(({ data }) => setRequests(data || []))
    }
  }, [user, view])

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
      Please log in to continue.
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-lg font-semibold mb-2">Request submitted</h2>
        <p className="text-sm text-gray-500 mb-6">
          We're finding a verified pro near you. You'll get a WhatsApp update when one is assigned.
        </p>
        <button
          onClick={() => { setSubmitted(null); setView('history') }}
          className="w-full bg-emerald-700 text-white text-sm font-medium py-3 rounded-xl hover:bg-emerald-800"
        >
          Track my request →
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Sure<span className="text-emerald-600">Pro</span></div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {['new', 'history'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {v === 'new' ? 'New request' : 'My jobs'}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        {view === 'new' && (
          <NewRequestForm categories={categories} onSubmitted={req => setSubmitted(req)} />
        )}

        {view === 'history' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Your service requests</h2>
            {requests.length === 0
              ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-3xl mb-3">📋</div>
                  <p className="text-sm">No requests yet.</p>
                  <button onClick={() => setView('new')} className="mt-4 text-sm text-emerald-600 font-medium">
                    Submit your first request →
                  </button>
                </div>
              )
              : requests.map(r => <RequestCard key={r.id} req={r} />)
            }
          </div>
        )}
      </div>
    </div>
  )
}