import { Button } from '@/components/ui/button'
import {
  isRouteErrorResponse,
  Link,
  useNavigate,
  useRouteError,
} from 'react-router-dom'

const ErrorPage = () => {
  const error = useRouteError() as { statusText?: string; message?: string }
  const navigate = useNavigate()

  let errorMessage: string
  let errorStatus: number | undefined
  let errorTitle = 'Oops! Something went wrong'

  if (isRouteErrorResponse(error)) {
    errorMessage =
      error.statusText ?? error.data?.message ?? 'An error occurred'
    errorStatus = error.status

    switch (error.status) {
      case 401:
        errorTitle = 'Unauthorized'
        errorMessage = 'You need to be logged in to access this page.'
        break
      case 403:
        errorTitle = 'Forbidden'
        errorMessage = 'You don not have permission to access this resource.'

        break
      case 500:
        errorTitle = 'Server Error'
        errorMessage =
          'Something went wrong on our end. Please try again later.'
        break
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = 'Unknown error occurred'
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md text-center">
        {errorStatus && (
          <p className="mb-4 text-7xl font-bold text-blue-600">{errorStatus}</p>
        )}

        <h1 className="mb-4 text-3xl font-bold text-gray-900">{errorTitle}</h1>

        <p className="mb-8 text-lg text-gray-600">{errorMessage}</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            ← Go back
          </Button>

          <Button asChild variant="link">
            <Link to="/">Go to homepage</Link>
          </Button>
        </div>

        {import.meta.env.NODE_ENV === 'development' &&
          error instanceof Error && (
            <details className="mt-8 rounded-lg bg-white p-4 text-left shadow">
              <summary className="cursor-pointer font-semibold text-gray-700">
                🔍 Error Details (Dev Only)
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-red-600">
                {error.stack}
              </pre>
            </details>
          )}
      </div>
    </div>
  )
}

export default ErrorPage
