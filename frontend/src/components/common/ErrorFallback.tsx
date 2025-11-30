import { Link } from 'react-router-dom'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Something went wrong
          </h1>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <p className="mb-4 text-left text-sm font-medium text-gray-700">
            Error Details:
          </p>
          <div className="max-h-48 overflow-auto rounded border bg-red-50 p-4 text-left">
            <p className="font-mono text-sm text-red-800">{error.message}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={resetErrorBoundary}>Try again</button>
          <Link to="/">Go back home</Link>
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback
