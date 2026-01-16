import { Spinner } from '@/components/ui/spinner'
import { useAdminAuthStore, useAuthStore } from '@/store/zustand/useAuthStore'
import { useEffect, useState } from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const userAuth = useAuthStore()
  const adminAuth = useAdminAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize both user and admin auth in parallel
        await Promise.all([
          userAuth.initializeAuth(),
          adminAuth.initializeAuth(),
        ])
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return <>{children}</>
}
