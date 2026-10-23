import { useQuery } from '@tanstack/react-query'

import { fetchConversation } from '../services/messagingApi'

import { useAuth } from '@/features/auth/hooks/useAuth'

export function useConversation(
  conversationId
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [
      'conversation',
      conversationId,
      user?.id,
    ],

    queryFn: () =>
      fetchConversation(
        conversationId,
        user.id
      ),

    enabled:
      Boolean(
        conversationId &&
        user?.id
      ),

    staleTime: 30_000,
  })
}