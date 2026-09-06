import { Search, SlidersHorizontal } from 'lucide-react'

export function SearchBar({ value, onChange, onFilterClick }) {
  return (
    <div className="flex items-center gap-2 px-6">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for a service or pro"
          className="w-full rounded-control border border-border bg-surface py-3 pl-11 pr-4 text-[15px] placeholder:text-muted focus:border-primary"
        />
      </div>
      <button
        type="button"
        onClick={onFilterClick}
        aria-label="Filters"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-border text-ink-soft"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>
    </div>
  )
}