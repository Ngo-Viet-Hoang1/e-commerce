import { lazy } from 'react'
import { type RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

const Home = lazy(() => import('@/pages/user/home/Home'))
const About = lazy(() => import('@/pages/common/About'))
const DashBoard = lazy(() => import('@/pages/user/Dashboard'))
const ProfileLayout = lazy(() => import('@/pages/user/profile/Profile'))
const ProfileInfo = lazy(() => import('@/pages/user/profile/ProfileInfo/ProfileInfo'))
const Orders = lazy(() => import('@/pages/user/profile/Orders'))
const FavoriteProducts = lazy(
  () => import('@/pages/user/profile/Favorite/FavoriteProducts'),
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
    handle: {
      breadcrumb: 'Giới thiệu',
    },
  },
  {
    element: <ProtectedRoute type="user" redirectPath="/auth/login" />,
    children: [
      {
        path: 'dashboard',
        element: <DashBoard />,
        handle: {
          breadcrumb: 'Bảng điều khiển',
        },
      },
      {
        path: 'product-catalog',
        element: <ProductCatalog />,
        handle: {
          breadcrumb: 'Danh mục sản phẩm',
        },
      },
      {
        path: 'product-detail/:slug',
        element: <ProductDetail />,
        handle: {
          breadcrumb: 'Chi tiết sản phẩm',
        },
      },
      {
        path: 'cart',
        element: <ShoppingCart />,
        handle: {
          breadcrumb: 'Giỏ hàng',
        },
      },
      {
        path: 'checkout',
        element: <Checkout />,
        handle: {
          breadcrumb: 'Thanh toán',
        },
      },
      {
        path: 'profile',
        element: <ProfileLayout />,
        handle: {
          breadcrumb: 'Tài khoản',
        },
        children: [
          {
            index: true,
            element: <ProfileInfo />,
            handle: {
              breadcrumb: 'Thông tin cá nhân',
            },
          },
          {
            path: 'orders',
            element: <Orders />,
            handle: {
              breadcrumb: 'Đơn hàng của tôi',
            },
          },
          {
            path: 'favorites',
            element: <FavoriteProducts />,
            handle: {
              breadcrumb: 'Sản phẩm yêu thích',
            },
          },
        ],
      },
    ],
  },
]
