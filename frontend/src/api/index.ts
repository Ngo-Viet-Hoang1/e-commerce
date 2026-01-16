/* eslint-disable no-console */
import { LOGIN_ROUTE, REFRESH_TOKEN_ENDPOINT } from '@/constants'
import type { IErrorResponse } from '@/interfaces/base-response.interface'
import { ApiError } from '@/models/ApiError'
import {
  useAdminAuthStore,
  useAuthStore,
  type AuthStore,
} from '@/store/zustand/useAuthStore'
import { navigateTo } from '@/utils/navigate.util'
import { progress } from '@/utils/nprogress.util'
import axios, {
  AxiosError,
  type AxiosResponse,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipToast?: boolean
  skipProgress?: boolean
}

interface AxiosInstanceProps {
  baseURL: string
  refreshTokenEndpoint: string
  loginRoute: string
  authStore: () => AuthStore
}

const createAuthAxiosInstance = ({
  baseURL,
  refreshTokenEndpoint,
  loginRoute,
  authStore,
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
    (config: CustomAxiosRequestConfig) => {
      if (!config.skipProgress) {
        progress.start()
      }
      // const token = localStorage.getItem(tokenKey)
      const { accessToken: token } = authStore()

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

      if (!error.response && originalRequest && !originalRequest._retry) {
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

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        progress.stop()
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
          const refreshApi = axios.create({
            baseURL: config.baseURL,
            withCredentials: true,
          })

          const res = await refreshApi.post(refreshTokenEndpoint)
          const accessToken = res.data.data.accessToken

          if (!accessToken) {
            authStore().reset()
            const error = new ApiError('No access token received', 401)
            processQueue(error, null)
            navigateTo(loginRoute)
            return Promise.reject(error)
          }

          // localStorage.setItem(tokenKey, accessToken)
          authStore().setAccessToken(accessToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`

          processQueue(null, accessToken)

          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError as Error, null)
          // localStorage.removeItem(tokenKey)
          authStore().reset()
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

const handleError = (axiosError: AxiosError<IErrorResponse>): ApiError => {
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

    const statusCode = error?.statusCode ?? axiosError.response.status ?? 500
    const msg =
      errorMessages[statusCode] ??
      axiosError.response.data.message ??
      'Something went wrong'

    const customConfig = axiosError.config as CustomAxiosRequestConfig
    if (!customConfig?.skipToast) {
      toast.error(msg)

      if (error?.details) {
        Object.entries(error.details).forEach(([_, messsages]) =>
          messsages.forEach((msg: string) => toast.error(msg)),
        )
      }
    }

    return new ApiError(
      msg,
      statusCode,
      error?.details as Record<string, string[]> | undefined,
    )
  } else if (axiosError.request) {
    if (!(axiosError.config as CustomAxiosRequestConfig)?.skipToast) {
      toast.error('Network Error - Please check your connection')
    }
    return new ApiError(
      'Network Error - Please check your connection',
      undefined,
      undefined,
      true,
    )
  } else {
    return new ApiError(axiosError.message ?? 'An unexpected error occurred')
  }
}

const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const api = createAuthAxiosInstance({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  refreshTokenEndpoint: REFRESH_TOKEN_ENDPOINT.USER,
  loginRoute: LOGIN_ROUTE.USER,
  authStore: () => useAuthStore.getState(),
})

export const adminApi = createAuthAxiosInstance({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  refreshTokenEndpoint: REFRESH_TOKEN_ENDPOINT.ADMIN,
  loginRoute: LOGIN_ROUTE.ADMIN,
  authStore: () => useAdminAuthStore.getState(),
})
