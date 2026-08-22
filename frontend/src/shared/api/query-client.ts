import { ApiError } from '@/shared/api'
import { QueryClient, type DefaultOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

const queryConfig: DefaultOptions = {
  queries: {
    // Retry configuration: Only retry once for 5xx/network errors, NEVER for 4xx errors
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status && error.status < 500) {
        return false
      }
      return failureCount < 1
    },
    retryDelay: 1000,

    // Stale time - data considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,

    // Cache time - unused data stays in cache for 10 minutes
    gcTime: 10 * 60 * 1000,

    // Refetch configuration: Disable aggressive window focus refetch
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,

    // Disable automatic refetching in the background
    refetchInterval: false,

    // Error handling
    throwOnError: false,

    // Network mode
    networkMode: 'online',
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
