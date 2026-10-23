// pages/admin_dashboard.jsx
// FIX vs original: "text-red" is not a valid Tailwind class (needs a shade) -> "text-red-500"
import { useState, useEffect, useCallback } from 'react'

const MOCK_PROVIDERS = [
  { id: 'p1', status: 'pending',   bio: 'Experienced electrician, 7 yrs residential wiring.',   location: 'Lekki Phase 1', profiles: { full_name: 'Emeka Adeyemi',  phone: '+234 803 111 2233', avatar_url: null }, work_samples: [] },
  { id: 'p2', status: 'approved',  bio: 'Licensed plumber. Pipe repair, burst pipes, fittings.', location: 'Yaba',         profiles: { full_name: 'Bello Aliyu',    phone: '+234 806 444 5566', avatar_url: null }, work_samples: [] },
  { id: 'p3', status: 'approved',  bio: 'AC installation and repairs. Carrier, LG, Daikin.',     location: 'Victoria Island', profiles: { full_name: 'Chisom Nwosu', phone: '+234 809 777 8800', avatar_url: null }, work_samples: [] },
  { id: 'p4', status: 'suspended', bio: 'Painter — interior and exterior. 200+ jobs done.',      location: 'Ajah',         profiles: { full_name: 'Funmi Okonkwo',  phone: '+234 812 333 4455', avatar_url: null }, work_samples: [] },
  { id: 'p5', status: 'pending',   bio: 'General cleaning and post-construction cleanup.',        location: 'Ikeja',        profiles: { full_name: 'Kemi Taiwo',     phone: '+234 815 666 7788', avatar_url: null }, work_samples: [] },
]

const MOCK_REQUESTS = [
  { id: 'r1', title: 'Power trip in living room',       status: 'pending',     is_urgent: true,  address: '14B Admiralty Way, Lekki', categories: { icon: '⚡', name: 'Electricians' },    profiles: { full_name: 'Mrs Adaobi Nwachukwu', phone: '+234 802 100 2200' }, providers: null,          image_url: null },
  { id: 'r2', title: 'Burst pipe under kitchen sink',   status: 'assigned',    is_urgent: false, address: '22 Oduduwa Crescent, Ikeja', categories: { icon: '💧', name: 'Plumbers' },       profiles: { full_name: 'Mr Tunde Bakare',       phone: '+234 805 200 3300' }, providers: { profiles: { full_name: 'Bello Aliyu' } }, image_url: null },
  { id: 'r3', title: 'AC not cooling — living room',    status: 'en_route',    is_urgent: false, address: '5 Karimu Kotun St, VI',    categories: { icon: '❄️', name: 'AC Technicians' }, profiles: { full_name: 'Sola Adebisi',          phone: '+234 808 300 4400' }, providers: { profiles: { full_name: 'Chisom Nwosu' } }, image_url: null },
  { id: 'r4', title: 'Full apartment deep clean',       status: 'in_progress', is_urgent: false, address: 'Block 7 Chevron Drive, Lekki', categories: { icon: '🏠', name: 'Cleaners' },   profiles: { full_name: 'Ngozi Eze',            phone: '+234 811 400 5500' }, providers: { profiles: { full_name: 'Kemi Taiwo' } },   image_url: null },
  { id: 'r5', title: 'Kitchen ceiling repaint',         status: 'completed',   is_urgent: false, address: '18 Allen Avenue, Ikeja',   categories: { icon: '🎨', name: 'Painters' },      profiles: { full_name: 'Deji Afolabi',          phone: '+234 814 500 6600' }, providers: { profiles: { full_name: 'Funmi Okonkwo' } }, image_url: null },
]

const MOCK_CATEGORIES = [
  { id: 'c1', icon: '⚡', name: 'Electricians' },
  { id: 'c2', icon: '💧', name: 'Plumbers' },
  { id: 'c3', icon: '🏠', name: 'Cleaners' },
  { id: 'c4', icon: '🎨', name: 'Painters' },
  { id: 'c5', icon: '❄️', name: 'AC Technicians' },
  { id: 'c6', icon: '🪚', name: 'Carpenters' },
]

const api = {
  getAllProviders:      async () => ({ data: MOCK_PROVIDERS }),
  getApprovedProviders: async () => ({ data: MOCK_PROVIDERS.filter(p => p.status === 'approved') }),
  updateProviderStatus: async (id, status) => ({ id, status }),
  getAllRequests:       async () => ({ data: MOCK_REQUESTS }),
  assignProvider:      async (requestId, providerId) => ({}),
  updateRequestStatus: async (id, status) => ({}),
  getCategories:       async () => ({ data: MOCK_CATEGORIES }),
  addCategory:         async (name, icon) => ({ data: { id: Date.now().toString(), name, icon } }),
  deleteCategory:      async (id) => ({}),
}

function Stat({ icon, label, value, sub, color = 'bg-emerald-50 text-emerald-700' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 ${color}`}>{icon}</div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Badge({ text, color }) {
  return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>{text}</span>
}

const PROVIDER_STATUS = {
  pending:   { text: 'Pending',   color: 'bg-amber-100 text-amber-700' },
  approved:  { text: 'Approved',  color: 'bg-emerald-100 text-emerald-700' },
  suspended: { text: 'Suspended', color: 'bg-red-100 text-red-600' },
}

const REQUEST_STATUS = {
  pending:     { text: 'Pending',      color: 'bg-gray-100 text-gray-600' },
  assigned:    { text: 'Assigned',     color: 'bg-blue-100 text-blue-700' },
  en_route:    { text: 'En route',     color: 'bg-amber-100 text-amber-700' },
  in_progress: { text: 'In progress',  color: 'bg-violet-100 text-violet-700' },
  completed:   { text: 'Completed',    color: 'bg-emerald-100 text-emerald-700' },
  cancelled:   { text: 'Cancelled',    color: 'bg-red-100 text-red-600' },
}

function ProvidersTab() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await api.getAllProviders()
    setProviders(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(id, status) {
    await api.updateProviderStatus(id, status)
    setProviders(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const filtered = filter === 'all' ? providers : providers.filter(p => p.status === filter)

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'pending', 'approved', 'suspended'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3.5 py-1.5 rounded-full border font-medium transition-colors capitalize
              ${filter === f ? 'bg-emerald-700 text-white border-emerald-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
          >
            {f === 'all' ? `All (${providers.length})` : `${f} (${providers.filter(p => p.status === f).length})`}
          </button>
        ))}
      </div>

      {loading
        ? <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
        : filtered.length === 0
          ? <p className="text-sm text-gray-400 py-8 text-center">No providers.</p>
          : (
            <div className="space-y-3">
              {filtered.map(p => {
                const s = PROVIDER_STATUS[p.status] || PROVIDER_STATUS.pending
                return (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {p.profiles?.avatar_url
                            ? <img src={p.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-lg">👤</span>}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.profiles?.full_name || '—'}</p>
                          <p className="text-xs text-gray-400">{p.profiles?.phone} · {p.location || 'No location'}</p>
                        </div>
                      </div>
                      <Badge text={s.text} color={s.color} />
                    </div>

                    {p.bio && <p className="text-xs text-gray-500 mt-2.5 line-clamp-2">{p.bio}</p>}

                    {p.work_samples?.length > 0 && (
                      <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
                        {p.work_samples.slice(0, 4).map((url, i) => (
                          <img key={i} src={url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 flex-wrap">
                      {p.status !== 'approved' && (
                        <button onClick={() => updateStatus(p.id, 'approved')}
                          className="text-xs bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg font-medium hover:bg-emerald-700">
                          ✓ Approve
                        </button>
                      )}
                      {p.status !== 'suspended' && (
                        <button onClick={() => updateStatus(p.id, 'suspended')}
                          className="text-xs bg-red-50 text-red-600 px-3.5 py-1.5 rounded-lg font-medium hover:bg-red-100 border border-red-200">
                          Suspend
                        </button>
                      )}
                      {p.status === 'suspended' && (
                        <button onClick={() => updateStatus(p.id, 'pending')}
                          className="text-xs bg-gray-100 text-gray-600 px-3.5 py-1.5 rounded-lg font-medium hover:bg-gray-200">
                          Reinstate
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
    </div>
  )
}

function StatusBtn({ label, onClick, color = 'blue' }) {
  const cls = {
    blue:    'bg-blue-600 hover:bg-blue-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
  }
  return (
    <button onClick={onClick} className={`text-xs text-white px-3.5 py-1.5 rounded-lg font-medium ${cls[color]}`}>
      {label}
    </button>
  )
}

function BookingsTab() {
  const [requests, setRequests]   = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading]     = useState(true)
  const [assigning, setAssigning] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: reqs }, { data: provs }] = await Promise.all([
      api.getAllRequests(),
      api.getApprovedProviders(),
    ])
    setRequests(reqs || [])
    setProviders(provs || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function assign(requestId, providerId) {
    const prov = providers.find(p => p.id === providerId)
    await api.assignProvider(requestId, providerId)
    setRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, status: 'assigned', providers: { profiles: { full_name: prov?.profiles?.full_name } } }
        : r
    ))
    setAssigning(null)
  }

  async function updateStatus(id, status) {
    await api.updateRequestStatus(id, status)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  return (
    <div>
      {loading
        ? <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
        : requests.length === 0
          ? <p className="text-sm text-gray-400 py-8 text-center">No requests yet.</p>
          : (
            <div className="space-y-3">
              {requests.map(r => {
                const s = REQUEST_STATUS[r.status] || REQUEST_STATUS.pending
                return (
                  <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div>
                        <p className="text-sm font-medium">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.categories?.icon} {r.categories?.name}
                          {r.is_urgent && <span className="ml-1.5 text-amber-600 font-medium">⚡ Urgent</span>}
                        </p>
                      </div>
                      <Badge text={s.text} color={s.color} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Customer</p>
                        <p className="text-xs font-medium">{r.profiles?.full_name || '—'}</p>
                        <p className="text-xs text-gray-400">{r.profiles?.phone}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Provider</p>
                        {r.providers
                          ? <p className="text-xs font-medium">{r.providers.profiles?.full_name}</p>
                          : <p className="text-xs text-gray-400">Not assigned</p>}
                      </div>
                    </div>

                    {r.address && <p className="text-xs text-gray-400 mb-3">📍 {r.address}</p>}
                    {r.image_url && (
                      <img src={r.image_url} alt="" className="w-20 h-16 rounded-lg object-cover mb-3" />
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {r.status === 'pending' && (
                        assigning === r.id
                          ? (
                            <div className="flex gap-2 items-center flex-wrap">
                              <select
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
                                defaultValue=""
                                onChange={e => e.target.value && assign(r.id, e.target.value)}
                              >
                                <option value="">Pick a provider…</option>
                                {providers.map(p => (
                                  <option key={p.id} value={p.id}>{p.profiles?.full_name} — {p.location}</option>
                                ))}
                              </select>
                              <button onClick={() => setAssigning(null)} className="text-xs text-gray-400">Cancel</button>
                            </div>
                          )
                          : (
                            <button onClick={() => setAssigning(r.id)}
                              className="text-xs bg-blue-600 text-white px-3.5 py-1.5 rounded-lg font-medium hover:bg-blue-700">
                              Assign provider
                            </button>
                          )
                      )}
                      {r.status === 'assigned'    && <StatusBtn label="Mark en route"    onClick={() => updateStatus(r.id, 'en_route')} />}
                      {r.status === 'en_route'    && <StatusBtn label="Mark in progress" onClick={() => updateStatus(r.id, 'in_progress')} />}
                      {r.status === 'in_progress' && <StatusBtn label="Mark completed"   onClick={() => updateStatus(r.id, 'completed')} color="emerald" />}
                      {!['completed', 'cancelled'].includes(r.status) && (
                        <button onClick={() => updateStatus(r.id, 'cancelled')}
                          className="text-xs bg-red-50 border border-red-200 text-red-600 px-3.5 py-1.5 rounded-lg font-medium hover:bg-red-100">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
    </div>
  )
}

function CategoriesTab() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName]       = useState('')
  const [newIcon, setNewIcon]       = useState('')
  const [loading, setLoading]       = useState(false)

  const load = useCallback(async () => {
    const { data } = await api.getCategories()
    setCategories(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  async function addCategory(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setLoading(true)
    const { data } = await api.addCategory(newName.trim(), newIcon.trim() || '🔧')
    setCategories(prev => [...prev, data])
    setNewName('')
    setNewIcon('')
    setLoading(false)
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return
    await api.deleteCategory(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <form onSubmit={addCategory} className="flex gap-2 mb-5 flex-wrap">
        <input
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm flex-1 outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Category name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <input
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-20 outline-none focus:ring-2 focus:ring-emerald-500 text-center"
          placeholder="Icon"
          value={newIcon}
          onChange={e => setNewIcon(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-800 disabled:opacity-60"
        >
          Add
        </button>
      </form>
      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{c.icon}</span>
              <span className="text-sm font-medium">{c.name}</span>
            </div>
            <button onClick={() => deleteCategory(c.id)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard({ onSignOut }) {
  const [tab, setTab]     = useState('providers')
  const [stats, setStats] = useState({ providers: 0, pending: 0, requests: 0, completed: 0 })

  useEffect(() => {
    async function loadStats() {
      const [{ data: provs }, { data: reqs }] = await Promise.all([
        api.getAllProviders(),
        api.getAllRequests(),
      ])
      setStats({
        providers: provs?.filter(p => p.status === 'approved').length || 0,
        pending:   provs?.filter(p => p.status === 'pending').length  || 0,
        requests:  reqs?.length || 0,
        completed: reqs?.filter(r => r.status === 'completed').length  || 0,
      })
    }
    loadStats()
  }, [tab])

  const TABS = ['providers', 'bookings', 'categories']

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="text-lg font-semibold">
          Sure<span className="text-emerald-600">Pro</span>
          <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Admin</span>
        </div>
        <button
          onClick={onSignOut ?? (() => alert('Sign out'))}
          className="text-sm text-white font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-2xl p-2"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Stat icon="✅" label="Active providers"  value={stats.providers} color="bg-emerald-50 text-emerald-700" />
          <Stat icon="⏳" label="Awaiting approval" value={stats.pending}   color="bg-amber-50 text-amber-700" sub="Review now" />
          <Stat icon="📋" label="Total requests"    value={stats.requests}  color="bg-blue-50 text-blue-700" />
          <Stat icon="🏁" label="Jobs completed"    value={stats.completed} color="bg-violet-50 text-violet-700" />
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-sm py-2 rounded-xl font-medium transition-colors capitalize
                ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'providers'  && <ProvidersTab />}
        {tab === 'bookings'   && <BookingsTab />}
        {tab === 'categories' && <CategoriesTab />}
      </div>
    </div>
  )
}