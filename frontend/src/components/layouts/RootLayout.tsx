import { Suspense } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Spinner } from '../ui/spinner'

export default function RootLayout() {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
        <nav className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold">
            Twilight
          </Link>

          <div className="flex gap-4">
            <NavLink to="/about">About</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </div>
        </nav>
      </header>

      <main className="container mx-auto flex flex-1 flex-col px-4 py-6">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="size-8" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Twiliver. All rights reserved.
      </footer>
    </div>
  )
}
