import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { CreatePostForm } from '../components/CreatePostForm'
import { useCreatePost } from '../hooks/useCreatePost'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createPostMutation = useCreatePost()

  // In SurePro, professionals.id = auth.uid()
  const professionalId = user?.id

  const handleSubmit = ({
    postType,
    caption,
    mediaUrls,
  }) => {
    if (!professionalId) {
      console.error('No professional ID found for current user')
      return
    }

    if (!mediaUrls?.length) {
      console.error('No media selected')
      return
    }

    const media = mediaUrls.map((item) => ({
      url: typeof item === 'string' ? item : item.url,
      isBefore: false,
      mediaType:
        typeof item === 'string'
          ? 'image'
          : item.type === 'video'
            ? 'video'
            : 'image',
    }))

    createPostMutation.mutate(
      {
        professionalId,
        caption: caption.trim(),
        postType,
        media,
      },
      {
        onSuccess: () => {
          navigate('/feed')
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-bg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-text">
              Create a post
            </h1>

            <p className="text-xs text-muted">
              Show customers what you do best
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-12">
        <CreatePostForm
          professionalId={professionalId}
          onSubmit={handleSubmit}
          isSubmitting={createPostMutation.isPending}
        />
      </main>
    </div>
  )
}