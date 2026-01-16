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
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/useCart'
import PromoBanner from './PromoBanner'
import ProductSearch from '@/components/layouts/product/search/ProductSearch'

interface HeaderProps {
  logo?: string
  isAuthenticated?: boolean
  user?: Me | null
  onLogout?: () => void
}

export default function Header({
  isAuthenticated = false,
  user,
  onLogout,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: cart } = useCart()
  const cartCount = cart?.summary?.itemCount ?? 0

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
    <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b shadow-sm backdrop-blur">
      <PromoBanner />

      <div className="mx-auto max-w-7xl px-6">
        <div className="hidden h-18 items-center justify-between gap-4 sm:flex">
          <Link
            to="/"
            className="from-primary to-primary/70 shrink-0 bg-linear-to-r bg-clip-text text-xl font-extrabold tracking-tight text-transparent transition hover:scale-105 hover:text-emerald-500 hover:opacity-90"
          >
            TechStore
          </Link>

          <div className="max-w-xl flex-1">
            <ProductSearch />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/cart"
              className="group hover:bg-muted flex items-center gap-2 rounded-xl p-2 transition-all hover:scale-105 hover:text-emerald-500"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:rotate-12" />
                <span className="text-primary border-primary absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full border bg-emerald-100 px-1 text-[9px] leading-none font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              </div>
              <span className="text-sm font-medium">Giỏ hàng</span>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all hover:scale-105 hover:text-emerald-500 focus:outline-none">
                  <User className="h-5 w-5" />
                  <span className="text-sm">
                    Xin chào, {user?.name ?? user?.email ?? 'Bạn'}
                  </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Thông tin cá nhân
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all hover:scale-105 hover:text-emerald-500"
              >
                <User className="h-5 w-5" />
                <span className="text-sm">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-3 py-3 sm:hidden">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-lg font-bold">
              TechStore
            </Link>

            <div className="flex items-center gap-3">
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-primary border-primary absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full border bg-emerald-100 px-1 text-[9px] leading-none font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              </Link>

              <Link to={isAuthenticated ? '/profile' : '/auth/login'}>
                <User className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch}>
            <div className="relative rounded-lg border">
              <Search className="absolute top-2.5 left-3 h-4 w-4 opacity-60" />
              <Input
                type="text"
                placeholder="Bạn muốn tìm gì?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  )
}
