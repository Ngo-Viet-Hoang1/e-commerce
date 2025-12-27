import { StrictMode, type ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import ErrorFallback from './components/common/ErrorFallback.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'

import 'nprogress/nprogress.css'
import { RouterProvider } from 'react-router-dom'
import 'stream-chat-react/dist/css/v2/index.css'
import './index.css'
import { QueryProvider } from './providers/QueryProvider.tsx'
import router from './routes/Routes.tsx'

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
