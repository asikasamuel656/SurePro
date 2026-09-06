import { ImageOff } from 'lucide-react'

export function GalleryGrid({ items }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-8 text-center">
        <ImageOff className="h-6 w-6 text-muted" />
        <p className="text-sm text-muted">No portfolio photos yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {items.map((item) => (
        <div key={item.id} className="aspect-square overflow-hidden rounded-lg bg-bg">
          <img
            src={item.image_url}
            alt={item.caption ?? 'Portfolio work'}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}