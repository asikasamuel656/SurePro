import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { fetchBlockedUsers, unblockUser } from '../services/safetyApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function BlockedUsers() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: blocked = [], isLoading } = useQuery({
    queryKey: ['blockedUsers', user?.id],
    queryFn: () => fetchBlockedUsers(user.id),
    enabled: !!user?.id,
  })

  const handleUnblock = async (blockedId) => {
    await unblockUser(user.id, blockedId)
    queryClient.invalidateQueries({ queryKey: ['blockedUsers', user?.id] })
  }

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
          <h1 className="text-base font-bold text-ink">Blocked users</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading && <div className="h-16 animate-pulse rounded-card bg-surface" />}

          {!isLoading && blocked.length === 0 && (
            <p className="pt-6 text-center text-sm text-muted">You haven't blocked anyone.</p>
          )}

          <div className="space-y-2">
            {blocked.map((row) => (
              <div key={row.blocked_id} className="flex items-center justify-between rounded-card border border-border bg-surface p-3">
                <span className="text-sm font-medium text-ink">{row.blocked?.full_name ?? 'User'}</span>
                <button
                  type="button"
                  onClick={() => handleUnblock(row.blocked_id)}
                  className="text-sm font-semibold text-primary"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}