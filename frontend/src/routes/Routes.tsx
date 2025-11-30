import RootLayout from '@/components/layouts/RootLayout'
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import ProtectedRoute from './ProtectedRoute'

const Home = lazy(() => import('@/pages/common/Home'))
const About = lazy(() => import('@/pages/common/About'))
const DashBoard = lazy(() => import('@/pages/user/Dashboard'))
const NotFound = lazy(() => import('@/pages/common/NotFound'))
const ErrorPage = lazy(() => import('@/pages/common/ErrorPage'))

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        element: <ProtectedRoute isAllowed />,
        children: [{ path: 'dashboard', element: <DashBoard /> }],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
