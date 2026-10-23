import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  BadgeCheck,
  BriefcaseBusiness,
} from 'lucide-react'

import { formatDistanceToNow } from 'date-fns'
import { clsx } from '@/utils/clsx'
import { MediaGrid } from '@/features/feed/components/MediaGrid'

export function PostCard({
  post,
  hasLiked,
  isSaved,
  onLike,
  onComment,
  onSave,
  onShare,
  onProfileClick,
}) {
  const name =
    post.professional?.profile?.full_name ??
    'SurePro professional'

  const avatarUrl =
    post.professional?.profile?.avatar_url

  const postType =
    post.post_type === 'before_after'
      ? 'Before & after'
      : post.post_type === 'promotion'
        ? 'Promotion'
        : 'Work update'

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">

      {/* Professional header */}
      <button
        type="button"
        onClick={onProfileClick}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary-light">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
              {name[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-ink">
              {name}
            </p>

            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted">
            <span>{postType}</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(
                new Date(post.created_at),
                { addSuffix: true }
              )}
            </span>
          </div>
        </div>

        <BriefcaseBusiness className="h-4 w-4 shrink-0 text-muted" />
      </button>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-5 text-ink-soft">
            {post.caption}
          </p>
        </div>
      )}

      {/* Media */}
      {post.media?.length > 0 && (
        <div className="overflow-hidden">
          <MediaGrid media={post.media} />
        </div>
      )}

      {/* Engagement */}
      <div className="flex items-center border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={onLike}
          className={clsx(
            'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition',
            hasLiked
              ? 'text-danger'
              : 'text-ink-soft'
          )}
        >
          <Heart
            className={clsx(
              'h-4.5 w-4.5',
              hasLiked && 'fill-danger'
            )}
          />

          <span>{post.likeCount ?? 0}</span>
        </button>

        <button
          type="button"
          onClick={onComment}
          className="ml-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-ink-soft"
        >
          <MessageCircle className="h-4.5 w-4.5" />

          <span>{post.commentCount ?? 0}</span>
        </button>

        <button
          type="button"
          onClick={onShare}
          className="ml-2 rounded-lg px-2 py-1.5 text-ink-soft"
          aria-label="Share post"
        >
          <Share2 className="h-4.5 w-4.5" />
        </button>

        <button
          type="button"
          onClick={onSave}
          className={clsx(
            'ml-auto rounded-lg px-2 py-1.5',
            isSaved
              ? 'text-primary'
              : 'text-ink-soft'
          )}
          aria-label="Save post"
        >
          <Bookmark
            className={clsx(
              'h-4.5 w-4.5',
              isSaved && 'fill-primary'
            )}
          />
        </button>
      </div>
    </article>
  )
}