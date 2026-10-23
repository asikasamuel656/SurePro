import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle } from 'lucide-react'
import { postDetailsPath, professionalProfilePath } from '@/constants/routes'
import { clsx } from '@/utils/clsx'

export function WorkPreviewCard({ post, className }) {
  const navigate = useNavigate()
  const name = post.professional?.profile?.full_name ?? 'SurePro professional'
  const image = post.media?.[0]?.media_url

  return (
    <div className={clsx('shrink-0 overflow-hidden rounded-card border border-border bg-surface', className ?? 'w-48')}>
      <button
        type="button"
        onClick={() => navigate(postDetailsPath(post.id))}
        className="block aspect-[4/3] w-full overflow-hidden bg-bg"
      >
        {image && <img src={image} alt="" className="h-full w-full object-cover" />}
      </button>
      <div className="p-2.5">
        <button
          type="button"
          onClick={() => navigate(professionalProfilePath(post.professional?.id))}
          className="truncate text-xs font-semibold text-ink"
        >
          {name}
        </button>
        {post.caption && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{post.caption}</p>}
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-soft">
          <span className="flex items-center gap-0.5">
            <Heart className="h-3 w-3" />
            {post.likeCount}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageCircle className="h-3 w-3" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </div>
  )
}