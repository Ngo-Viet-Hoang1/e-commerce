import { useAuthStore } from '@/store/zustand/useAuthStore'
import { Heart, LogOut, Mail, Package, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const Profile = () => {
  const { me, reset } = useAuthStore()

  const handleLogout = () => {
    reset()
    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen justify-center bg-white pt-3">
      <div className="flex w-full items-start gap-8">
        {/* Left frame */}
        <div className="flex w-[22%] flex-col items-center gap-4 self-start rounded-xl border border-gray-300 pt-8 shadow-lg shadow-gray-300">
          {/* icon user */}
          <div className="grid h-20 w-20 place-items-center rounded-full border border-gray-300 text-gray-500">
            <User className="h-10 w-10" />
          </div>

          {/* info */}
          <div className="space-y-1 text-center">
            <p className="text-lg font-semibold text-gray-800">{me?.name}</p>
            <p className="text-sm text-gray-500">
              <Mail className="mr-1 mb-0.5 inline h-4 w-4" />
              {me?.email}
            </p>
          </div>
          {/* menu */}
          <div className="mt-6 flex w-full flex-col gap-2 px-2 pb-4 text-sm">
            <NavLink
              to="/profile"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-2 py-2 transition ${isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <User className="h-4 w-4" />
              <span>Thông tin cá nhân</span>
            </NavLink>

            <NavLink
              to="/profile/orders"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-2 py-2 transition ${isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <Package className="h-4 w-4" />
              <span>Đơn hàng</span>
            </NavLink>

            <NavLink
              to="/profile/favorites"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-2 py-2 transition ${isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <Heart className="h-4 w-4 text-red-500" />
              <span>Sản phẩm yêu thích</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-red-600 transition hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Right frame */}
        <div className="flex-1 self-start rounded-xl border border-gray-300 p-6 shadow-lg shadow-gray-300">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Profile
