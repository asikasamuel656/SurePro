import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { ProfessionalCard } from '@/components/cards/ProfessionalCard'
import { useSavedProfessionals, useSavedPostsList, useFollowingList } from '../hooks/unSaved'
import { professionalProfilePath, postDetailsPath } from '@/constants/routes'
import { clsx } from '@/utils/clsx'

const TABS = [
  { key: 'professionals', label: 'Saved Pros' },
  { key: 'posts', label: 'Saved Posts' },
  { key: 'following', label: 'Following' },
]

function toCardShape(p) {
  return {
    id: p.id,
    full_name: p.profile?.full_name,
    avatar_url: p.profile?.avatar_url,
    category_name: p.category?.name,
    rating: p.rating,
    is_available: p.is_available,
  }
}

export function Saved() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('professionals')
  const { data: savedPros = [], isLoading: loadingPros } = useSavedProfessionals()
  const { data: savedPosts = [], isLoading: loadingPosts } = useSavedPostsList()
  const { data: following = [], isLoading: loadingFollowing } = useFollowingList()

  const isLoading = { professionals: loadingPros, posts: loadingPosts, following: loadingFollowing }[tab]

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-ink">Saved & Following</h1>
        </div>

        <div className="flex gap-2 border-b border-border bg-surface px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                tab === t.key ? 'bg-primary-light text-primary' : 'text-muted'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {isLoading && (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-card bg-surface" />
              ))}
            </div>
          )}

          {!isLoading && tab === 'professionals' && savedPros.length === 0 && (
            <p className="pt-6 text-center text-sm text-muted">No saved professionals yet.</p>
          )}
          {!isLoading &&
            tab === 'professionals' &&
            savedPros.map((p) => (
              <ProfessionalCard
                key={p.id}
                professional={toCardShape(p)}
                onClick={() => navigate(professionalProfilePath(p.id))}
              />
            ))}

          {!isLoading && tab === 'following' && following.length === 0 && (
            <p className="pt-6 text-center text-sm text-muted">You're not following anyone yet.</p>
          )}
          {!isLoading &&
            tab === 'following' &&
            following.map((p) => (
              <ProfessionalCard
                key={p.id}
                professional={toCardShape(p)}
                onClick={() => navigate(professionalProfilePath(p.id))}
              />
            ))}

          {!isLoading && tab === 'posts' && savedPosts.length === 0 && (
            <p className="pt-6 text-center text-sm text-muted">No saved posts yet.</p>
          )}
          {!isLoading && tab === 'posts' && (
            <div className="grid grid-cols-3 gap-1.5">
              {savedPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => navigate(postDetailsPath(post.id))}
                  className="aspect-square overflow-hidden rounded-lg bg-surface"
                >
                  {post.media?.[0]?.media_url && (
                    <img src={post.media[0].media_url} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}