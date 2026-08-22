import { ChatWidget } from '@/widgets/chat'
import { DynamicBreadcrumb } from '@/widgets/admin-sidebar'
import StreamChatProvider from '@/app/providers/StreamChatProvider'
import { useAuthStore } from '@/features/auth'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/shared/ui/spinner'
import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'

const noFooterRoutes = ['/profile']
const noBreadcrumbRoutes = ['/', '/about']

export default function RootLayout() {
  const me = useAuthStore((s) => s.me)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const reset = useAuthStore((s) => s.reset)
  const location = useLocation()

  const showFooter = !noFooterRoutes.some((route) =>
    location.pathname.startsWith(route),
  )

  const showBreadcrumb =
    !noBreadcrumbRoutes.includes(location.pathname) &&
    !location.pathname.startsWith('/auth')

  return (
    <StreamChatProvider role="user">
      <div className="flex min-h-dvh w-full flex-col">
        <Header isAuthenticated={isAuthenticated} user={me} onLogout={reset} />

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 py-6">
            {showBreadcrumb && <DynamicBreadcrumb />}

            <Suspense
              fallback={
                <div className="flex min-h-[50vh] flex-1 items-center justify-center">
                  <Spinner className="size-8" />
                </div>
              }
            >
              <div key={location.pathname} className="animate-in fade-in-50 duration-300">
                <Outlet />
              </div>
              <ChatWidget />
            </Suspense>
          </div>
        </main>

        {showFooter && <Footer />}
      </div>
    </StreamChatProvider>
  )
}
