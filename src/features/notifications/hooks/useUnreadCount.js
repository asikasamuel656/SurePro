import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchUnreadCount, subscribeToNotifications } from '../services/notificationsApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useUnreadCount() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['unreadNotificationCount', user?.id],
    queryFn: () => fetchUnreadCount(user.id),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (!user?.id) return undefined
    const unsubscribe = subscribeToNotifications(user.id, () => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', user.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] })
    })
    return unsubscribe
  }, [user?.id, queryClient])

  return query.data ?? 0
}