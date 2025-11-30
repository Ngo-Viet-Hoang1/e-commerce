import { StrictMode, type ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import App from './App.tsx'
import ErrorFallback from './components/common/ErrorFallback.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'

import 'nprogress/nprogress.css'
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
        <App />
        <Toaster />
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)
