import type { JSX } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'

const ErrorBoundaryWrapper = (
  Component: React.LazyExoticComponent<() => JSX.Element>,
  customFallback?: React.FC,
) => (
  <ErrorBoundary
    FallbackComponent={customFallback ?? ErrorFallback}
    onError={(_error, _errorInfo) => {
      /* empty */
    }}
    onReset={() => {
      window.location.reload()
    }}
  >
    <Component />
  </ErrorBoundary>
)

export default ErrorBoundaryWrapper
