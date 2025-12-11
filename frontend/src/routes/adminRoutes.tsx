import { Navigate, type RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { lazy } from 'react'

const DashBoard = lazy(() => import('@/pages/user/Dashboard'))

export const adminRoutes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    element: <ProtectedRoute isAllowed redirectPath="/admin/auth/login" />,
    children: [
      {
        path: 'dashboard',
        element: <DashBoard />,
      },
    ],
  },
]
