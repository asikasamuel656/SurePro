import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationsApi'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export function useNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const notificationKey = ['notifications', user?.id]
  const unreadKey = ['unreadNotificationCount', user?.id]

  const query = useQuery({
    queryKey: notificationKey,
    queryFn: () => fetchNotifications(user.id),
    enabled: !!user?.id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: notificationKey,
    })

    queryClient.invalidateQueries({
      queryKey: unreadKey,
    })
  }

  /*
   * Listen for new notifications in real time.
   *
   * When Supabase inserts a notification for this user,
   * refresh the notification list and unread count.
   */
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(
            '🔔 New notification received:',
            payload.new
          )

          invalidate()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(
            '🔔 Notification updated:',
            payload.new
          )

          invalidate()
        }
      )
      .subscribe((status) => {
        console.log(
          `🔔 Notification realtime status for ${user.id}:`,
          status
        )
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(user.id),
    onSuccess: invalidate,
  })

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,

    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,

    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  }
}