// // components/profession_modal.jsx
// import { useMemo, useState } from 'react'

// export default function ProfessionModal({
//   open,
//   professions = [],
//   selectedId,
//   onSelect,
//   onClose,
//   title = "Choose a profession",
//   subtitle = "Pick the one that best describes what you need.",
// }) {
//   const [query, setQuery] = useState('')

//   const grouped = useMemo(() => {
//     const q = query.trim().toLowerCase()
//     const filtered = professions.filter((p) => p.name.toLowerCase().includes(q))
//     const byCategory = {}
//     filtered.forEach((p) => {
//       byCategory[p.category] = byCategory[p.category] || []
//       byCategory[p.category].push(p)
//     })
//     return byCategory
//   }, [professions, query])

//   if (!open) return null

//   return (
//     <div
//       className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
//         <div className="p-5 border-b border-gray-100">
//           <div className="flex items-start justify-between mb-3">
//             <div>
//               <h2 className="text-sm font-medium text-gray-900">{title}</h2>
//               <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-4"
//             >
//               ✕
//             </button>
//           </div>
//           <input
//             autoFocus
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search professions…"
//             className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
//           />
//         </div>

//         <div className="overflow-y-auto p-4 flex-1">
//           {Object.keys(grouped).length === 0 && (
//             <p className="text-sm text-gray-400 text-center py-8">
//               No professions match "{query}".
//             </p>
//           )}
//           {Object.entries(grouped).map(([category, items]) => (
//             <div key={category} className="mb-4 last:mb-0">
//               <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
//                 {category}
//               </div>
//               <div className="grid grid-cols-2 gap-2">
//                 {items.map((p) => {
//                   const on = selectedId === p.id
//                   return (
//                     <button
//                       key={p.id}
//                       type="button"
//                       onClick={() => {
//                         onSelect(p.id)
//                         onClose()
//                       }}
//                       className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all
//                         ${
//                           on
//                             ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
//                             : 'border-gray-200 hover:border-gray-300 text-gray-700'
//                         }`}
//                     >
//                       <span className="text-lg flex-shrink-0">{p.icon}</span>
//                       <span className="truncate">{p.name}</span>
//                       {on && <span className="ml-auto text-emerald-500 flex-shrink-0">✓</span>}
//                     </button>
//                   )
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }


// src/components/profession_modal.jsx
// Searchable "View all professions" modal — single-select.
import { useMemo, useState } from 'react'

export default function ProfessionModal({
  open,
  professions,
  selectedId,
  onSelect,
  onClose,
  title = 'Choose your profession',
  subtitle = 'Pick the one that best describes what you do.',
}) {
  const [query, setQuery] = useState('')

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = professions.filter((p) => p.name.toLowerCase().includes(q))
    const byCategory = {}
    filtered.forEach((p) => {
      byCategory[p.category] = byCategory[p.category] || []
      byCategory[p.category].push(p)
    })
    return byCategory
  }, [professions, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-sm font-medium text-gray-900">{title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-4">✕</button>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search professions…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {Object.keys(grouped).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No professions match "{query}".</p>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-4 last:mb-0">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">{category}</div>
              <div className="grid grid-cols-2 gap-2">
                {items.map((p) => {
                  const on = selectedId === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { onSelect(p.id); onClose() }}
                      className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all
                        ${on ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                    >
                      <span className="text-lg flex-shrink-0">{p.icon}</span>
                      <span className="truncate">{p.name}</span>
                      {on && <span className="ml-auto text-emerald-500 flex-shrink-0">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}