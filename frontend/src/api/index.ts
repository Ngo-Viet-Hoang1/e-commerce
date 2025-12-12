import {
  ACCESS_TOKEN_KEY,
  LOGIN_ROUTE,
  REFRESH_TOKEN_ENDPOINT,
} from '@/constants'
import type { IErrorResponse } from '@/interfaces/base-response.interface'
import { ApiError } from '@/models/ApiError'
import { navigateTo } from '@/utils/navigate.util'
import { progress } from '@/utils/nprogress.util'
import axios, {
  AxiosError,
  type AxiosResponse,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'

interface AxiosInstanceProps {
  baseURL: string
  tokenKey: string
  refreshTokenEndpoint: string
  loginRoute: string
}

const createAuthAxiosInstance = ({
  baseURL,
  tokenKey,
  refreshTokenEndpoint,
  loginRoute,
}: AxiosInstanceProps) => {
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

  const config: CreateAxiosDefaults = {
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  }

  const api = axios.create(config)

  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (!config.headers?.['X-Skip-Progress']) {
        progress.start()
      }
      const token = localStorage.getItem(tokenKey)

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
        progress.stop()
        originalRequest.retryCount = originalRequest.retryCount ?? 0

        if (originalRequest.retryCount < MAX_RETRIES) {
          originalRequest.retryCount++
          progress.stop()
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

        originalRequest._retry = true
        isRefreshing = true

        try {
          const { data } = await api.post(
            `${config.baseURL}${refreshTokenEndpoint}`,
            {},
            { headers: { 'X-Skip-Progress': 'true' } },
          )

          const { access_token } = data
          if (!access_token) {
            navigateTo(loginRoute)
          }
          localStorage.setItem(tokenKey, access_token)

          originalRequest.headers.Authorization = `Bearer ${access_token}`

          processQueue(null, access_token)

          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError as Error, null)
          localStorage.removeItem(tokenKey)
          navigateTo(loginRoute)

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      progress.stop()
      return Promise.reject(handleError(error))
    },
  )

  return api
}

const handleError = (axiosError: AxiosError<IErrorResponse>) => {
  if (axiosError.response?.data) {
    const { message, error } = axiosError.response.data

    const errorMessages: Record<number, string> = {
      400: message ?? 'Bad Request',
      401: message ?? 'Unauthorized - Please login again',
      403: message ?? 'Forbidden - You do not have permission',
      404: message ?? 'Resource not found',
      409: message ?? 'Conflict - Resource already exists',
      422: message ?? 'Validation Error',
      429: 'Too many requests - Please try again later',
      500: 'Internal Server Error - Please try again',
      502: 'Bad Gateway - Service temporarily unavailable',
      503: 'Service Unavailable - Please try again later',
      504: 'Gateway Timeout - Request took too long',
    }

    const msg =
      errorMessages[error.statusCode] ??
      axiosError.response.data.message ??
      'Something went wrong'

    if (!axiosError.config?.headers?.['X-Skip-Toast']) {
      toast.error(msg)

      if (error.details) {
        Object.entries(error.details).forEach(([_, messsages]) =>
          messsages.forEach((msg: string) => toast.error(msg)),
        )
      }
    }

    return Promise.reject(
      new ApiError(
        msg,
        error.statusCode,
        error.details as Record<string, string[]> | undefined,
      ),
    )
  } else if (axiosError.request) {
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
      new ApiError(axiosError.message ?? 'An unexpected error occurred'),
    )
  }
}

const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const api = createAuthAxiosInstance({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  tokenKey: ACCESS_TOKEN_KEY.USER,
  refreshTokenEndpoint: REFRESH_TOKEN_ENDPOINT.USER,
  loginRoute: LOGIN_ROUTE.USER,
})

export const adminApi = createAuthAxiosInstance({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  tokenKey: ACCESS_TOKEN_KEY.ADMIN,
  refreshTokenEndpoint: REFRESH_TOKEN_ENDPOINT.ADMIN,
  loginRoute: LOGIN_ROUTE.ADMIN,
})
