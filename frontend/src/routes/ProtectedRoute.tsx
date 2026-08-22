import { useAdminAuthStore, useAuthStore } from '@/store/zustand/useAuthStore'
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
  const authStore = type === 'admin' ? useAdminAuthStore : useAuthStore
  const isAuthenticated = authStore((s) => s.isAuthenticated)
  const me = authStore((s) => s.me)
  const hasRole = me?.roles?.some(
    (role: string) => role.toUpperCase() === type.toUpperCase(),
  )

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  if (!hasRole) return <Navigate to={'/forbidden'} replace />

  return children ?? <Outlet />
}

export default ProtectedRoute
