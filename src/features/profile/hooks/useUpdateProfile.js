import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateOwnProfile } from '@/services/profileApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates) => {
      if (!user?.id) {
        throw new Error('You must be signed in to update your profile.')
      }

      return updateOwnProfile(user.id, updates)
    },

    onSuccess: (updatedProfile) => {
      if (!user?.id) return

      // Keep the profile query fresh.
      queryClient.invalidateQueries({
        queryKey: ['profile', user.id],
      })

      // Also update the cached profile immediately when this query exists.
      queryClient.setQueryData(
        ['profile', user.id],
        updatedProfile
      )
    },
  })
}