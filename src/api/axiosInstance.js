import axios from 'axios'
import { mockRequest } from './mockData'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('finance_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('finance_token')
      localStorage.removeItem('finance_user')
      window.dispatchEvent(new Event('finance:unauthorized'))
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export const apiRequest = async (method, url, options = {}) => {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return mockRequest(method, url, options)
  }
  const response = await apiClient.request({ method, url, ...options })
  return response.data
}

export default apiClient
