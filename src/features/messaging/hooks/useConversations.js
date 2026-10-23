import { useQuery } from '@tanstack/react-query'
import { fetchConversations } from '../services/messagingApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useConversations() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['conversations', user?.id],

    queryFn: () =>
      fetchConversations(user.id),

    enabled: Boolean(user?.id),

    staleTime: 30_000,
  })
}