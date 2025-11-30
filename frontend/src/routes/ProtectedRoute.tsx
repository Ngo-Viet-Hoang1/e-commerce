import { Navigate, Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
  isAllowed: boolean
  redirectPath?: string
  children?: React.ReactNode
}

const ProtectedRoute = ({
  isAllowed,
  redirectPath = '/',
  children,
}: ProtectedRouteProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />
  }

  return children ?? <Outlet />
}

export default ProtectedRoute
