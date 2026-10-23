import { formatDistanceToNow } from 'date-fns'

export function CommentList({ comments }) {
  if (comments.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">No comments yet. Be the first.</p>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const name = comment.user?.full_name ?? 'SurePro user'
        const avatarUrl = comment.user?.avatar_url
        return (
          <div key={comment.id} className="flex items-start gap-2.5">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-bg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted">
                  {name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-semibold text-ink">{name}</span>{' '}
                <span className="text-ink-soft">{comment.content}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}