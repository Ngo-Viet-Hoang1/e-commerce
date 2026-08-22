import { ModeToggle } from '@/shared/ui/ModeToggle'
import DynamicBreadcrumb from './DynamicBreadcrumb'
import { Separator } from '@/shared/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/shared/ui/sidebar'
import { Spinner } from '@/shared/ui/spinner'
import StreamChatProvider from '@/app/providers/StreamChatProvider'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'

export default function Page() {
  return (
    <StreamChatProvider role="admin">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <DynamicBreadcrumb className="mb-0" />
              </div>

              <ModeToggle />
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-3 p-3 pt-0">
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
        </SidebarInset>
      </SidebarProvider>
    </StreamChatProvider>
  )
}
