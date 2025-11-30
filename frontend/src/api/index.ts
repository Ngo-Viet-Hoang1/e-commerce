import { ApiError } from '@/models/ApiError'
import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'

const config = {
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredientials: true,
}

const api = axios.create(config)

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    config.headers['X-Request-ID'] = generateRequestId()

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      console.log('API Response:', response)
    }

    return response
  },
  async (error) => {
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      console.error('API Response Error:', error)
    }

    return Promise.reject(handleError(error))
  },
)

const handleError = (error: AxiosError) => {
  if (error.response) {
    const { status, data } = error.response as {
      status: number
      data: { message?: string; errors?: Record<string, string[]> }
    }

    const errorMessages: Record<number, string> = {
      400: data?.message ?? 'Bad Request',
      401: data?.message ?? 'Unauthorized - Please login again',
      403: data?.message ?? 'Forbidden - You do not have permission',
      404: data?.message ?? 'Resource not found',
      409: data?.message ?? 'Conflict - Resource already exists',
      422: data?.message ?? 'Validation Error',
      429: 'Too many requests - Please try again later',
      500: 'Internal Server Error - Please try again',
      502: 'Bad Gateway - Service temporarily unavailable',
      503: 'Service Unavailable - Please try again later',
      504: 'Gateway Timeout - Request took too long',
    }

    const message =
      errorMessages[status] ?? data?.message ?? 'Something went wrong'

    if (!error.config?.headers?.['X-Skip-Toast']) {
      toast.error(message)
    }

    return Promise.reject(new ApiError(message, status, data?.errors))
  } else if (error.request) {
    toast.error('Network Error - Please check your connection')
    return Promise.reject(
      new ApiError(
        'Network Error - Please check your connection',
        undefined,
        undefined,
        true,
      ),
    )
  } else {
    return Promise.reject(
      new ApiError(error.message ?? 'An unexpected error occurred'),
    )
  }
}

const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default api
