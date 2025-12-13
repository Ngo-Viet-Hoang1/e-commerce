import { lazy } from 'react'
import { type RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

const Home = lazy(() => import('@/pages/common/Home'))
const About = lazy(() => import('@/pages/common/About'))
const DashBoard = lazy(() => import('@/pages/user/Dashboard'))

export const userRoutes: RouteObject[] = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: 'about',
    element: <About />,
  },
  {
    element: <ProtectedRoute type="user" redirectPath="/auth/login" />,
    children: [{ path: 'dashboard', element: <DashBoard /> }],
  },
]
