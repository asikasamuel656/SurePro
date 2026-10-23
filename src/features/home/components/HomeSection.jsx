// src/features/home/components/HomeSection.jsx
export function HomeSection({ title, onSeeAll, children, isEmpty, emptyMessage }) {
  return (
    <div className="pt-2">
      <div className="mb-2 flex items-center justify-between px-6">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {onSeeAll && !isEmpty && (
          <button type="button" onClick={onSeeAll} className="text-xs font-semibold text-primary">
            See all
          </button>
        )}
      </div>
      {isEmpty ? (
        <p className="px-6 text-sm text-muted">{emptyMessage}</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-6 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4">
          {children}
        </div>
      )}
    </div>
  )
}