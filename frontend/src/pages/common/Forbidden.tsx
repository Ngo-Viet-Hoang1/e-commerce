import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function Forbidden() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert size={28} />
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-gray-800">
          403 – Forbidden
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          You don’t have permission to access this page.
          <br />
          Please contact the administrator if you believe this is a mistake.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Go back
          </button>

          <Link
            to="/"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
