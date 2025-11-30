import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

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

    return Promise.reject(error)
  },
)

const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default api
