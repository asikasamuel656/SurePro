// components/request_modal.jsx
// ─────────────────────────────────────────────────────────────
// This is the source of the "job type" fix — a request now always
// carries professionId + professionName (same PROFESSIONS list used
// in provider_register.jsx's profession step), so
// application_page.jsx's job-type display has a real field to show
// instead of falling back to "General service".
//
// customer_dashboard.jsx renders this and handles the actual
// Firestore write in onCreated — this component only collects the
// form data and (if a photo was picked) uploads it to Cloudinary
// before calling onCreated.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { PROFESSIONS } from '../lib/professions'
import ProfessionModal from './profession_modal'
import { uploadToCloudinary } from '../services/cloudinary'

const QUICK_PICK_IDS = ['electrician', 'plumber', 'cleaner', 'painter', 'ac_technician']

function ProfessionPicker({ professionId, onSelect, error }) {
  const [modalOpen, setModalOpen] = useState(false)
  const quickPicks = QUICK_PICK_IDS.map((id) => PROFESSIONS.find((p) => p.id === id)).filter(Boolean)
  const selected = PROFESSIONS.find((p) => p.id === professionId)
  const selectedIsQuickPick = quickPicks.some((p) => p.id === professionId)

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Service type</label>

      {selected && !selectedIsQuickPick && (
        <button type="button" onClick={() => setModalOpen(true)} className="w-full flex items-center gap-2.5 border-2 border-emerald-500 bg-emerald-50 rounded-xl px-4 py-3 mb-2.5 text-left">
          <span className="text-lg flex-shrink-0">{selected.icon}</span>
          <span className="text-sm font-medium text-emerald-800 flex-1">{selected.name}</span>
          <span className="text-xs text-emerald-600">change</span>
        </button>
      )}

      <div className="grid grid-cols-3 gap-2">
        {quickPicks.map((p) => {
          const on = professionId === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(on ? null : p.id)}
              className={`flex flex-col items-center gap-1.5 border rounded-xl p-3 text-xs font-medium transition-all ${on ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
            >
              <span className="text-xl">{p.icon}</span>
              {p.name}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`flex flex-col items-center justify-center gap-1.5 border rounded-xl p-3 text-xs font-medium transition-all ${selected && !selectedIsQuickPick ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-dashed border-gray-300 hover:border-emerald-400 text-gray-500 hover:text-emerald-700'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          View all
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

      <ProfessionModal open={modalOpen} professions={PROFESSIONS} selectedId={professionId} onSelect={onSelect} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default function RequestModal({ open, onClose, onCreated, loading }) {
  const [form, setForm] = useState({ professionId: '', title: '', description: '', budgetMin: '', budgetMax: '', address: '' })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: null })) }

  function pickImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.professionId) errs.professionId = 'Choose a service'
    if (!form.title.trim()) errs.title = 'Describe the job briefly'
    if (!form.address.trim()) errs.address = 'We need your address'
    if (Object.keys(errs).length) return setErrors(errs)

    const profession = PROFESSIONS.find((p) => p.id === form.professionId)

    setUploading(true)
    try {
      let imageUrl = null
      if (image) {
        const result = await uploadToCloudinary(image)
        imageUrl = result.url
      }

      const requestId = await onCreated({
        professionId: form.professionId,
        professionName: profession?.name || '',
        title: form.title.trim(),
        description: form.description.trim(),
        budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
        address: form.address.trim(),
        imageUrl,
      })

      if (requestId) {
        setForm({ professionId: '', title: '', description: '', budgetMin: '', budgetMax: '', address: '' })
        setImage(null)
        setPreview(null)
      }
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null
  const busy = loading || uploading

  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-medium text-gray-900">Post a request</h2>
            <p className="text-xs text-gray-400 mt-0.5">Describe what you need — providers will apply.</p>
          </div>
          <button onClick={() => !busy && onClose()} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-4">✕</button>
        </div>

        <form onSubmit={submit}>
          <ProfessionPicker professionId={form.professionId} onSelect={(id) => { setForm((f) => ({ ...f, professionId: id })); setErrors((e) => ({ ...e, professionId: null })) }} error={errors.professionId} />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job title</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Fix leaking kitchen pipe"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition ${errors.title ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe the problem and what you need done…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min budget (₦)</label>
              <input type="number" min={0} value={form.budgetMin} onChange={set('budgetMin')} placeholder="20000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max budget (₦)</label>
              <input type="number" min={0} value={form.budgetMax} onChange={set('budgetMax')} placeholder="50000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo of the problem <span className="text-gray-400 font-normal">(optional)</span></label>
            <label className="flex items-center gap-3 cursor-pointer border border-dashed border-gray-200 rounded-xl p-3 hover:border-emerald-400 transition-colors">
              {preview ? <img src={preview} alt="" className="w-14 h-14 rounded-lg object-cover" /> : <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-2xl">📷</div>}
              <span className="text-sm text-emerald-600 font-medium">{preview ? 'Change photo' : 'Add a photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={pickImage} />
            </label>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input value={form.address} onChange={set('address')} placeholder="e.g. 14 Adeola Odeku, Victoria Island"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition ${errors.address ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={busy} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
              {busy ? 'Posting…' : 'Post request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}