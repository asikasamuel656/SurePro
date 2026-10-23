import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMessages, subscribeToMessages, markConversationRead } from '../services/messagingApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useMessages(conversationId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [liveMessages, setLiveMessages] = useState([])

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId,
  })

  useEffect(() => {
    setLiveMessages([])
    if (!conversationId) return undefined

    const unsubscribe = subscribeToMessages(conversationId, (newMessage) => {
      setLiveMessages((prev) => (prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]))
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    return unsubscribe
  }, [conversationId, queryClient])

  useEffect(() => {
    if (conversationId && user?.id) {
      markConversationRead(conversationId, user.id).catch(() => {})
    }
  }, [conversationId, user?.id, liveMessages.length])

  const baseMessages = query.data ?? []
  const merged = [
    ...baseMessages,
    ...liveMessages.filter((m) => !baseMessages.some((b) => b.id === m.id)),
  ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  return { messages: merged, isLoading: query.isLoading, isError: query.isError }
}