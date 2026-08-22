import { StrictMode, type ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import ErrorFallback from '@/shared/ui/ErrorFallback'
import { ThemeProvider, QueryProvider, router } from '@/app'

import 'nprogress/nprogress.css'
import { RouterProvider } from 'react-router-dom'
import 'stream-chat-react/dist/css/v2/index.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(_error: Error, _info: ErrorInfo) => {
          /* empty */
        }}
        onReset={() => {
          /* empty */
        }}
      >
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
        <Toaster position="top-right" richColors closeButton />
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)
