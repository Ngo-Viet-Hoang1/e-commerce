import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="grid h-dvh place-items-center">
      <div className="text-center">
        <p className="text-6xl font-semibold">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty sm:text-xl/8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild variant="link">
            <Link to="/">Go back home</Link>
          </Button>
          <Button asChild variant="link">
            <Link to="#">
              Contact support <span aria-hidden="true">&rarr;</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
