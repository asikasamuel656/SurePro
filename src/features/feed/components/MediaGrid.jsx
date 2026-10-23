export function MediaGrid({ media }) {
  if (!media || media.length === 0) return null

  const before = media.find((m) => m.is_before)
  const after = media.find((m) => !m.is_before)

  if (media.length === 2 && before) {
    return (
      <div className="grid grid-cols-2 gap-1">
        <div className="relative aspect-square overflow-hidden bg-bg">
          <img src={before.media_url} alt="Before" className="h-full w-full object-cover" />
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            Before
          </span>
        </div>
        <div className="relative aspect-square overflow-hidden bg-bg">
          <img src={after.media_url} alt="After" className="h-full w-full object-cover" />
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
            After
          </span>
        </div>
      </div>
    )
  }

  if (media.length === 1) {
    return (
      <div className="aspect-[4/3] overflow-hidden bg-bg">
        <img src={media[0].media_url} alt="" className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {media.slice(0, 6).map((item) => (
        <div key={item.id} className="aspect-square overflow-hidden bg-bg">
          <img src={item.media_url} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  )
}