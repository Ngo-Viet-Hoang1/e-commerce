import { Spinner } from '@/shared/ui/spinner'
import {
  authReadyPromise,
  useAdminAuthStore,
  useAuthStore,
} from '@/features/auth'
import { useEffect, useState } from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [ready, setReady] = useState(() => {
    return (
      useAuthStore.getState().isInitialized &&
      useAdminAuthStore.getState().isInitialized
    )
  })

  useEffect(() => {
    if (!ready) {
      void authReadyPromise.finally(() => setReady(true))
    }
  }, [ready])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return <>{children}</>
}
