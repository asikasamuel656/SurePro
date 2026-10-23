import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage } from '../services/messagingApi'

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values) => sendMessage({ conversationId, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}