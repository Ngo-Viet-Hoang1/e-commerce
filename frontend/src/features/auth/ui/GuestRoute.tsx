import { useAdminAuthStore, useAuthStore } from '../model/auth.store'
import { Navigate, Outlet } from 'react-router-dom'

interface GuestRouteProps {
  redirectPath?: string
  authType?: 'user' | 'admin'
}

const GuestRoute = ({
  redirectPath = '/',
  authType = 'user',
}: GuestRouteProps) => {
  const authStore = authType === 'admin' ? useAdminAuthStore : useAuthStore
  const isAuthenticated = authStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export default GuestRoute
