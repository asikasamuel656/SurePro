import { useMemo } from 'react'
import { useConversations } from './useConversations'

export function useUnreadMessageCount() {
  const { data: conversations = [] } = useConversations()
  return useMemo(() => conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0), [conversations])
}