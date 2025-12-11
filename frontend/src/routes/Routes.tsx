import AdminLayout from '@/components/layouts/AdminLayout'
import AuthLayout from '@/components/layouts/AuthLayout'
import RootLayout from '@/components/layouts/RootLayout'
import AdminLogin from '@/pages/admin/AdminLogin'
import Login from '@/pages/user/auth/Login'
import Register from '@/pages/user/auth/Register'
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { adminRoutes } from './adminRoutes'
import { userRoutes } from './userRoutes'

const NotFound = lazy(() => import('@/pages/common/NotFound'))
const ErrorPage = lazy(() => import('@/pages/common/ErrorPage'))

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: userRoutes,
  },
  {
    path: '/auth',
    Component: AuthLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    errorElement: <ErrorPage />,
    children: adminRoutes,
  },
  {
    path: '/admin/auth',
    Component: AuthLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'login',
        element: <AdminLogin />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
