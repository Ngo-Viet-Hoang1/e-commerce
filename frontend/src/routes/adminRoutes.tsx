import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const UserManagement = lazy(
  () => import('@/pages/admin/UserManagement/UserManagement'),
)
const OrderManagement = lazy(
  () => import('@/pages/admin/OrderManagement/OrderManagement'),
)

export const adminRoutes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    element: <ProtectedRoute type="admin" redirectPath="/admin/auth/login" />,
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'user-management',
        element: <UserManagement />,
      },
      {
        path: 'order-management',
        element: <OrderManagement />,
      },
    ],
  },
]
