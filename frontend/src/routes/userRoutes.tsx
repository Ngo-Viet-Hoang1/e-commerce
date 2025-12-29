import { lazy } from 'react'
import { type RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

const Home = lazy(() => import('@/pages/user/home/Home'))
const About = lazy(() => import('@/pages/common/About'))
const DashBoard = lazy(() => import('@/pages/user/Dashboard'))
const ProfileLayout = lazy(() => import('@/pages/user/profile/Profile'))
const ProfileInfo = lazy(() => import('@/pages/user/profile/ProfileInfo'))
const Orders = lazy(() => import('@/pages/user/profile/Orders'))
const FavoriteProducts = lazy(
  () => import('@/pages/user/profile/FavoriteProducts'),
)
const ProductCatalog = lazy(
  () => import('@/pages/user/product-catalog/ProductCatalog'),
)
const ProductDetail = lazy(
  () => import('@/pages/user/product-detail/ProductDetail'),
)
const ShoppingCart = lazy(() => import('@/pages/user/cart/ShoppingCart'))
const Checkout = lazy(() => import('@/pages/user/checkout/Checkout'))

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
    children: [
      { path: 'dashboard', element: <DashBoard /> },
      { path: 'product-catalog', element: <ProductCatalog /> },
      { path: 'product-detail/:slug', element: <ProductDetail /> },
      { path: 'cart', element: <ShoppingCart /> },
      { path: 'checkout', element: <Checkout /> },
      {
        path: 'profile',
        element: <ProfileLayout />,
        children: [
          {
            index: true,
            element: <ProfileInfo />,
          },
          {
            path: 'orders',
            element: <Orders />,
          },
          {
            path: 'favorites',
            element: <FavoriteProducts />,
          },
        ],
      },
    ],
  },
]
