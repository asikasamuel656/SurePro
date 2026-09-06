import { useQuery } from '@tanstack/react-query'
import {
  fetchProfessionalProfile,
  fetchServices,
  fetchPortfolio,
  fetchReviews,
  fetchFollowerCount,
} from '../services/professionalApi'

export function useProfessionalProfile(professionalId) {
  const profileQuery = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: () => fetchProfessionalProfile(professionalId),
    enabled: !!professionalId,
  })

  const servicesQuery = useQuery({
    queryKey: ['professional', professionalId, 'services'],
    queryFn: () => fetchServices(professionalId),
    enabled: !!professionalId,
  })

  const portfolioQuery = useQuery({
    queryKey: ['professional', professionalId, 'portfolio'],
    queryFn: () => fetchPortfolio(professionalId),
    enabled: !!professionalId,
  })

  const reviewsQuery = useQuery({
    queryKey: ['professional', professionalId, 'reviews'],
    queryFn: () => fetchReviews(professionalId),
    enabled: !!professionalId,
  })

  const followerCountQuery = useQuery({
    queryKey: ['professional', professionalId, 'followerCount'],
    queryFn: () => fetchFollowerCount(professionalId),
    enabled: !!professionalId,
  })

  return {
    profile: profileQuery.data,
    services: servicesQuery.data ?? [],
    portfolio: portfolioQuery.data ?? [],
    reviews: reviewsQuery.data ?? [],
    followerCount: followerCountQuery.data ?? 0,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
  }
}