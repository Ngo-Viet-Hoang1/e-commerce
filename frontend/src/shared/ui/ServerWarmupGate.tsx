import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { API_BASE_URL } from '@/shared/constants'
import { authReadyPromise } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { Spinner } from '@/shared/ui/spinner'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ServerWarmupGateProps {
  children: React.ReactNode
}

export const ServerWarmupGate = ({ children }: ServerWarmupGateProps) => {
  const { isLoading, isError, refetch } = useQuery({
    queryKey: ['server-health'],
    queryFn: async () => {
      await axios.get(`${API_BASE_URL}/health`, { timeout: 15000 })
      await authReadyPromise
      return true
    },
    retry: 8,
    retryDelay: 3000,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
        <div className="flex max-w-sm flex-col items-center text-center">
          <Spinner className="mb-4 size-8 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Connecting to server...
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Waking up backend service from cold start. This may take a moment.
          </p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
        <div className="flex max-w-sm flex-col items-center text-center">
          <AlertCircle className="mb-4 size-8 text-destructive" />
          <h2 className="text-base font-semibold text-foreground">
            Server did not respond
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Unable to connect to the backend service.
          </p>
          <Button
            size="sm"
            className="mt-4 gap-2"
            onClick={() => void refetch()}
          >
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ServerWarmupGate
