import { Spinner } from '@/components/ui/spinner'
import { useAdminAuthStore, useAuthStore } from '@/store/zustand/useAuthStore'
import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
  redirectPath?: string
  children?: React.ReactNode
  type?: 'user' | 'admin'
}

const ProtectedRoute = ({
  redirectPath = '/',
  children,
  type = 'user',
}: ProtectedRouteProps) => {
  const userAuth = useAuthStore()
  const adminAuth = useAdminAuthStore()

  const authStore = type === 'admin' ? adminAuth : userAuth
  const { me, isAuthenticated, isInitialized, initializeAuth } = authStore
  const hasRole = me?.roles?.includes(type)

  useEffect(() => {
    if (!isInitialized) {
      void initializeAuth()
    }
  }, [isInitialized, initializeAuth])

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  if (!hasRole) return <Navigate to={'/forbidden'} replace />

  return children ?? <Outlet />
}

export default ProtectedRoute
