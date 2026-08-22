import App from '@/app/App'
import { AdminLayout } from '@/widgets/admin-sidebar'
import RootLayout from '@/widgets/layouts/RootLayout'
import AdminLogin from '@/pages/admin/AdminLogin'
import Login from '@/pages/user/auth/Login'
import Register from '@/pages/user/auth/Register'
import { authReadyPromise } from '@/features/auth'
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { adminRoutes } from './adminRoutes'
import { GuestRoute } from '@/features/auth'
import { userRoutes } from './userRoutes'

const Forbidden = lazy(() => import('@/pages/common/Forbidden'))
const NotFound = lazy(() => import('@/pages/common/NotFound'))
const ErrorPage = lazy(() => import('@/pages/common/ErrorPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    loader: () => authReadyPromise,
    children: [
      {
        path: '/',
        Component: RootLayout,
        errorElement: <ErrorPage />,
        children: userRoutes,
      },
      {
        path: '/auth',
        element: <GuestRoute redirectPath="/" authType="user" />,
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
        element: (
          <GuestRoute authType="admin" redirectPath="/admin/dashboard" />
        ),
        errorElement: <ErrorPage />,
        children: [
          {
            path: 'login',
            element: <AdminLogin />,
          },
        ],
      },
      {
        path: 'forbidden',
        element: <Forbidden />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

export default router
