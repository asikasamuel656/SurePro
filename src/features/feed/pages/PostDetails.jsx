import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { PostCard } from '@/components/cards/PostCard'
import { CommentList } from '../components/CommentList'
import { CommentBox } from '../components/CommentBox'
import { fetchPost } from '../services/feedApi'
import { useComments } from '../hooks/useComments'
import { useLike } from '../hooks/useLike'
import { useSavedPosts } from '../hooks/useSavedPosts'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { professionalProfilePath } from '@/constants/routes'

export function PostDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
  })
  const { comments, addComment, isAdding } = useComments(id)
  const likeMutation = useLike()
  const { isSaved, toggle: toggleSave } = useSavedPosts()

  if (isLoading || !post) {
    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </div>
    )
  }

  const hasLiked = post.reactions?.some((r) => r.user_id === user?.id)

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-ink">Post</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <PostCard
            post={post}
            hasLiked={hasLiked}
            isSaved={isSaved(post.id)}
            onLike={() => likeMutation.mutate({ postId: post.id, hasReacted: hasLiked })}
            onComment={() => {}}
            onSave={() => toggleSave(post.id)}
            onShare={() => navigator.clipboard.writeText(window.location.href)}
            onProfileClick={() => navigate(professionalProfilePath(post.professional?.id))}
          />

          <div className="px-4 py-4">
            <h2 className="mb-3 text-sm font-bold text-ink">Comments</h2>
            <CommentList comments={comments} />
          </div>
        </div>

        <CommentBox onSubmit={addComment} isSubmitting={isAdding} />
      </div>
    </div>
  )
}