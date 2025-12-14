import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, useAdminAuthStore } from '@/store/zustand/useAuthStore'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'

interface GuestRouteProps {
  redirectPath?: string
  authType?: 'user' | 'admin'
}

const GuestRoute = ({
  redirectPath = '/',
  authType = 'user',
}: GuestRouteProps) => {
  const userAuth = useAuthStore()
  const adminAuth = useAdminAuthStore()

  const authStore = authType === 'admin' ? adminAuth : userAuth
  const { isAuthenticated, isInitialized, initializeAuth } = authStore

  useEffect(() => {
    if (!isInitialized) {
      void initializeAuth()
    }
  }, [isInitialized, initializeAuth])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export default GuestRoute
