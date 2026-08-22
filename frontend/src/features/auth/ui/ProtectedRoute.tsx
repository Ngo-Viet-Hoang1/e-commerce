import { useAdminAuthStore, useAuthStore } from '@/features/auth'
import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/shared/ui/spinner'

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
  const authStore = type === 'admin' ? useAdminAuthStore : useAuthStore
  const isAuthenticated = authStore((s) => s.isAuthenticated)
  const me = authStore((s) => s.me)

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  // Prevent flash of 403 Forbidden while user profile is still being loaded
  if (!me) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  const hasRole = me?.roles?.some(
    (role: string) => role.toUpperCase() === type.toUpperCase(),
  )

  if (!hasRole) return <Navigate to={'/forbidden'} replace />

  return children ?? <Outlet />
}

export default ProtectedRoute
