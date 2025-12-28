import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Me } from '@/interfaces/auth.interface'
import { LogOut, Search, ShoppingCart, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

interface HeaderProps {
    logo?: string
    cartCount?: number
    isAuthenticated?: boolean
    user?: Me | null
    onLogout?: () => void
}

export default function Header({
    cartCount = 0,
    isAuthenticated = false,
    user,
    onLogout,
}: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            

            window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
        }
    }

    const handleLogout = () => {
        onLogout?.()
        window.location.href = '/'
    }

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex items-center justify-between h-18 gap-4">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-1 text-gray-800 font-bold text-xl shrink-0 hover:text-red-600 hover:scale-105 transition-all duration-200"
                    >
                        <span>{"TechStore"}</span>
                    </Link>

                    {/* Search Bar */}
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 max-w-xl"
                    >
                        <div className="relative flex items-center border border-gray-300 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-400 hover:shadow-sm focus-within:border-red-500 focus-within:shadow-md">
                            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Bạn muốn tìm gì?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="group flex items-center gap-2 text-gray-700 hover:text-red-600 transition-all duration-200 hover:scale-105"
                        >
                            <div className="relative">
                                <ShoppingCart className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                                <span className="absolute -top-2 -right-2 h-3.5 w-3.5 flex items-center justify-center text-[8px] text-gray-500 font-bold rounded-full border border-gray-500 transition-all duration-200 group-hover:text-red-600 group-hover:border-red-600 group-hover:scale-110">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            </div>
                            <span className="text-sm font-medium">Giỏ hàng</span>
                        </Link>

                        {/* User */}
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 text-gray-700 border border-gray-200 rounded-full hover:text-red-600 hover:border-transparent transition-all duration-200 hover:scale-105 focus:outline-none">
                                    <User className="h-5 w-5" />
                                    <span className="hidden sm:inline text-sm">
                                        Xin chào, {user?.name ?? user?.email ?? 'Bạn'}
                                    </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                                            <User className="h-4 w-4" />
                                            Thông tin cá nhân
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-red-600 cursor-pointer focus:text-red-600"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                to="/auth/login"
                                className="flex items-center gap-2 px-3 py-1.5 text-gray-700 border border-gray-200 rounded-full hover:text-red-600 hover:border-transparent transition-all duration-200 hover:scale-105"
                            >
                                <User className="h-5 w-5" />
                                <span className="hidden sm:inline text-sm">Đăng nhập</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
