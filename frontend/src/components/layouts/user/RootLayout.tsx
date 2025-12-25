import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Spinner } from '../../ui/spinner'
import Header from './Header'
import Footer from './Footer'
import { useAuthStore } from '@/store/zustand/useAuthStore'

export default function RootLayout() {
  const { me, isAuthenticated, reset } = useAuthStore()

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <Header
        isAuthenticated={isAuthenticated}
        user={me}
        onLogout={reset}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center min-h-[50vh]">
                <Spinner className="size-8" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
