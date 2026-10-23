import { useMutation } from '@tanstack/react-query'
import { startConversation } from '../services/messagingApi'

export function useStartConversation() {
  return useMutation({
    mutationFn: ({ otherUserId, jobId }) => startConversation(otherUserId, jobId),
  })
}