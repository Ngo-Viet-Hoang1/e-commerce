import { ApiError } from '@/models/ApiError'
import { progress } from '@/utils/nprogress.util'
import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface QueueItem {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error)
    } else {
      p.resolve(token)
    }
  })
  failedQueue = []
}

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
    if (!config.headers?.['X-Skip-Progress']) {
      progress.start()
    }

    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    config.headers['X-Request-ID'] = generateRequestId()

    return config
  },
  (error) => {
    progress.stop()
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      console.log('API Response:', response)
    }

    progress.stop()
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (import.meta.env.VITE_NODE_ENV === 'development') {
      console.error('API Response Error:', error)
    }

    if (!error.response && originalRequest) {
      originalRequest.retryCount = originalRequest.retryCount ?? 0

      if (originalRequest.retryCount < MAX_RETRIES) {
        originalRequest.retryCount++

        console.log(
          `🔄 Retrying request (${originalRequest.retryCount}/${MAX_RETRIES})...`,
        )

        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * originalRequest.retryCount),
        )
        return api(originalRequest)
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      const navigate = useNavigate()
      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(`${config.baseURL}/auth/refresh`)

        const { access_token } = response.data
        if (!access_token) navigate('/auth/login')
        localStorage.setItem('access_token', access_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`

        processQueue(null, access_token)

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error, null)
        localStorage.removeItem('access_token')
        navigate('/auth/login')

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    progress.stop()
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
