import { API_BASE_URL, REFRESH_TOKEN_ENDPOINT } from '@/shared/constants'
import type { IErrorResponse } from '@/shared/types'
import { ApiError } from '@/shared/api'
import {
  useAdminAuthStore,
  useAuthStore,
  type AuthStore,
} from '@/features/auth'
import { progress } from '@/shared/utils/nprogress.util'
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
  authStore: () => AuthStore
}

const createAuthAxiosInstance = ({
  baseURL,
  refreshTokenEndpoint,
  authStore,
}: AxiosInstanceProps) => {
  interface QueueItem {
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
  }

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

      progress.stop()

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
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
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(handleError(error))
    },
  )

  return api
}

const handleError = (axiosError: AxiosError<IErrorResponse>): ApiError => {
  if (axiosError.response?.data) {
    const { message, error } = axiosError.response.data

    const errorMessages: Record<number, string> = {
      400: message ?? 'Yêu cầu không hợp lệ',
      401: message ?? 'Phiên đăng nhập hết hạn - Vui lòng đăng nhập lại',
      403: message ?? 'Bạn không có quyền thực hiện thao tác này',
      404: message ?? 'Không tìm thấy dữ liệu yêu cầu',
      409: message ?? 'Dữ liệu đã tồn tại trong hệ thống',
      422: message ?? 'Dữ liệu không hợp lệ',
      429: 'Bạn thao tác quá nhanh - Vui lòng thử lại sau giây lát',
      500: 'Lỗi hệ thống máy chủ - Vui lòng thử lại sau',
      502: 'Dịch vụ tạm thời không khả dụng',
      503: 'Hệ thống đang bảo trì - Vui lòng thử lại sau',
      504: 'Yêu cầu hết thời gian chờ phản hồi',
    }

    const statusCode = error?.statusCode ?? axiosError.response.status ?? 500
    const msg =
      errorMessages[statusCode] ??
      axiosError.response.data.message ??
      'Đã xảy ra lỗi không xác định'

    const customConfig = axiosError.config as CustomAxiosRequestConfig
    const isGetRequest = axiosError.config?.method?.toLowerCase() === 'get'

    // Only display automatic toast for mutations (POST/PUT/DELETE/PATCH) or explicit requests, not background GET queries
    if (!customConfig?.skipToast && !isGetRequest && statusCode !== 401) {
      toast.error(msg)

      if (error?.details) {
        if (Array.isArray(error.details)) {
          error.details.forEach((item: unknown) => {
            if (typeof item === 'string') {
              toast.error(item)
            } else if (
              item &&
              typeof item === 'object' &&
              'message' in item &&
              typeof (item as { message: unknown }).message === 'string'
            ) {
              toast.error((item as { message: string }).message)
            }
          })
        } else if (typeof error.details === 'object') {
          Object.values(error.details).forEach((val: unknown) => {
            if (Array.isArray(val)) {
              val.forEach((m: unknown) => typeof m === 'string' && toast.error(m))
            } else if (typeof val === 'string') {
              toast.error(val)
            }
          })
        }
      }
    }

    return new ApiError(
      msg,
      statusCode,
      error?.details as Record<string, string[]> | undefined,
    )
  } else if (axiosError.request) {
    const isGetRequest = axiosError.config?.method?.toLowerCase() === 'get'
    if (
      !(axiosError.config as CustomAxiosRequestConfig)?.skipToast &&
      !isGetRequest
    ) {
      toast.error('Lỗi kết nối máy chủ - Vui lòng kiểm tra đường truyền mạng')
    }
    return new ApiError(
      'Lỗi kết nối máy chủ - Vui lòng kiểm tra đường truyền mạng',
      undefined,
      undefined,
      true,
    )
  } else {
    return new ApiError('Đã xảy ra lỗi không xác định', undefined, undefined, true)
  }
}

const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const api = createAuthAxiosInstance({
  baseURL: API_BASE_URL,
  refreshTokenEndpoint: REFRESH_TOKEN_ENDPOINT.USER,
  authStore: () => useAuthStore.getState(),
})

export const adminApi = createAuthAxiosInstance({
  baseURL: API_BASE_URL,
  refreshTokenEndpoint: REFRESH_TOKEN_ENDPOINT.ADMIN,
  authStore: () => useAdminAuthStore.getState(),
})
