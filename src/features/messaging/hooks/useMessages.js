
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchMessages,
  subscribeToMessages,
  markConversationRead,
} from '../services/messagingApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useMessages(conversationId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: Boolean(conversationId),
  })

  useEffect(() => {
    if (!conversationId) return undefined

    const unsubscribe = subscribeToMessages(
      conversationId,
      () => {
        queryClient.invalidateQueries({
          queryKey: ['messages', conversationId],
        })

        queryClient.invalidateQueries({
          queryKey: ['conversations'],
        })

        if (user?.id) {
          markConversationRead(conversationId, user.id).catch(() => {})
        }
      }
    )

    return unsubscribe
  }, [conversationId, queryClient, user?.id])

  useEffect(() => {
    if (conversationId && user?.id) {
      markConversationRead(conversationId, user.id).catch(() => {})
    }
  }, [conversationId, user?.id])

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
