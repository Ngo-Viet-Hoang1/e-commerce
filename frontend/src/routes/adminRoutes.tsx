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
const CategoryManagement = lazy(
  () => import('@/pages/admin/CategoryMangement/CategoryManagement'),
)
const BrandManagement = lazy(
  () => import('@/pages/admin/BrandManagement/BrandManagement'),
)
const ProductManagement = lazy(
  () => import('@/pages/admin/ProductManagement/ProductManagement'),
)
// const CreateProductPage = lazy(
//   () => import('@/pages/admin/ProductManagement/CreateProductPage'),
// )
// const EditProductPage = lazy(
//   () => import('@/pages/admin/ProductManagement/EditProductPage'),
// )

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
      {
        path: 'category-management',
        element: <CategoryManagement />,
      },
      {
        path: 'brand-management',
        element: <BrandManagement />,
      },
      {
        path: '/admin/products',
        element: <ProductManagement />,
      },
      // {
      //   path: '/admin/products/create',
      //   element: <CreateProductPage />,
      // },
      // {
      //   path: '/admin/products/edit/:id',
      //   element: <EditProductPage />,
      // },
    ],
  },
]
