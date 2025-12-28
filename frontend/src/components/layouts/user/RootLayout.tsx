import StreamChatProvider from '@/providers/StreamChatProvider'
import { useAuthStore } from '@/store/zustand/useAuthStore'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../../ui/spinner'
import Footer from './Footer'
import Header from './Header'
import { ChatWidget } from '@/components/common/chat/ChatWidget'

const noFooterRoutes = ['/profile']

export default function RootLayout() {
  const { me, isAuthenticated, reset } = useAuthStore()
  const location = useLocation()

  const showFooter = !noFooterRoutes.some((route) =>
    location.pathname.startsWith(route),
  )

  return (
    <StreamChatProvider role="user">
      <div className="flex min-h-dvh w-full flex-col">
        <Header isAuthenticated={isAuthenticated} user={me} onLogout={reset} />

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <Suspense
              fallback={
                <div className="flex min-h-[50vh] flex-1 items-center justify-center">
                  <Spinner className="size-8" />
                </div>
              }
            >
              <Outlet />
              <ChatWidget />
            </Suspense>
          </div>
        </main>

        {showFooter && <Footer />}
      </div>
    </StreamChatProvider>
  )
}
