import { ApiError } from '@/models/ApiError'
import { QueryClient, type DefaultOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

const queryConfig: DefaultOptions = {
  queries: {
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof ApiError && error.status && error.status < 500) {
        return false
      }
      // Retry up to 3 times for 5xx errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Stale time - data considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes

    // Cache time - unused data stays in cache for 10 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)

    // Refetch configuration
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch on component mount if data is stale
    refetchOnReconnect: true, // Refetch when network reconnects

    // Disable automatic refetching in the background
    refetchInterval: false,

    // Error handling
    throwOnError: false, // Handle errors in components, not globally

    // Network mode
    networkMode: 'online', // 'online' | 'always' | 'offlineFirst'
  },

  mutations: {
    // Retry mutations once on network errors only
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isNetworkError) {
        return failureCount < 1
      }
      return false
    },

    throwOnError: false,

    networkMode: 'online',

    onError: (error) => {
      if (error instanceof ApiError) {
        // Don't show toast if skip-toast header was set
        if (!(!!error.errors && Object.keys(error.errors).length > 0)) {
          toast.error(error.message)
        }
      }
    },
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})
