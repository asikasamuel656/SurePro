// components/service_type_picker.jsx
// ─────────────────────────────────────────────────────────────
// A grid of common professions (as tiles) + a final "View all" tile.
// Clicking "View all" opens the searchable ProfessionModal so a
// provider/customer whose trade isn't in the shortlist can still
// find it. Single-select only — matches the V2 spec's "a provider
// can only choose ONE profession" rule.
//
// Used by:
//   - pages/provider_register.jsx (Step 3: choose your profession)
//   - pages/request.jsx (customer: what kind of pro do you need)
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { PROFESSIONS } from '../lib/mockBackend'
import ProfessionModal from './profession_modal'

const QUICK_PICK_IDS = ['electrician', 'plumber', 'cleaner', 'painter', 'ac_technician']

export default function ServiceTypePicker({ selectedId, onSelect, label = 'Service type', error }) {
  const [modalOpen, setModalOpen] = useState(false)
  const quickPicks = QUICK_PICK_IDS.map((id) => PROFESSIONS.find((p) => p.id === id)).filter(Boolean)
  const selected = PROFESSIONS.find((p) => p.id === selectedId)
  const selectedIsQuickPick = quickPicks.some((p) => p.id === selectedId)

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      {/* if they picked something from "View all" that isn't one of the visible tiles, show it as its own row */}
      {selected && !selectedIsQuickPick && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full flex items-center gap-2.5 border-2 border-emerald-500 bg-emerald-50 rounded-xl px-4 py-3 mb-2.5 text-left"
        >
          <span className="text-lg flex-shrink-0">{selected.icon}</span>
          <span className="text-sm font-medium text-emerald-800 flex-1">{selected.name}</span>
          <span className="text-xs text-emerald-600">change</span>
        </button>
      )}

      <div className="grid grid-cols-3 gap-2">
        {quickPicks.map((p) => {
          const on = selectedId === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(on ? null : p.id)}
              className={`flex flex-col items-center gap-1.5 border rounded-xl p-3 text-xs font-medium transition-all
                ${on ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
            >
              <span className="text-xl">{p.icon}</span>
              {p.name}
            </button>
          )
        })}

        {/* replaces the old fixed "Carpenters" tile */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`flex flex-col items-center justify-center gap-1.5 border rounded-xl p-3 text-xs font-medium transition-all
            ${selected && !selectedIsQuickPick ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-dashed border-gray-300 hover:border-emerald-400 text-gray-500 hover:text-emerald-700'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          View all
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

      <ProfessionModal
        open={modalOpen}
        professions={PROFESSIONS}
        selectedId={selectedId}
        onSelect={(id) => onSelect(id)}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}