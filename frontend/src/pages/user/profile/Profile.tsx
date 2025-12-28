import { useAuthStore } from "@/store/zustand/useAuthStore";
import { Heart, LogOut, Package, User } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const Profile = () => {

    const { me, reset } = useAuthStore()

    const handleLogout = () => {
        reset()
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-white flex justify-center pt-3">
            <div className="flex items-start gap-8 w-[100%] h-[85vh]">
                {/* Left frame */}
                <div
                    className="w-[22%] rounded-xl border border-gray-300 shadow-lg shadow-gray-300
               flex flex-col items-center pt-8 gap-4"
                >
                    {/* icon user */}
                    <div className="w-20 h-20 rounded-full border border-gray-300 grid place-items-center text-gray-500">
                        <User className="w-10 h-10" />
                    </div>

                    {/* info */}
                    <div className="text-center space-y-1">
                        <p className="text-lg font-semibold text-gray-800">
                            {me?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {me?.email}
                        </p>
                    </div>
                    {/* menu */}
                    <div className="mt-6 w-full flex flex-col gap-2 text-sm pb-4 px-2">
                        <NavLink to="/profile" end className={({ isActive }) =>
                            `flex items-center gap-2 px-2 py-2 rounded-lg transition
                            ${isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`
                        }>
                            <User className="w-4 h-4" />
                            <span>Thông tin cá nhân</span>
                        </NavLink>

                        <NavLink to="/profile/orders" className={({ isActive }) =>
                            `flex items-center gap-2 px-2 py-2 rounded-lg transition
                            ${isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`
                        }>
                            <Package className="w-4 h-4" />
                            <span>Đơn hàng</span>
                        </NavLink>

                        <NavLink to="/profile/favorites" className={({ isActive }) =>
                            `flex items-center gap-2 px-2 py-2 rounded-lg transition
                            ${isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`
                        }>
                            <Heart className="w-4 h-4" />
                            <span>Sản phẩm yêu thích</span>
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-2 py-2 rounded-lg transition text-red-600 hover:bg-red-100"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>

                {/* Right frame */}
                <div className="flex-1 h-full rounded-xl border border-gray-300 shadow-lg shadow-gray-300 p-6">
                    <Outlet />
                </div>
            </div>

        </div>
    )
}

export default Profile;