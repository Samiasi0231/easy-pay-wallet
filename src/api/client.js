import axios from 'axios'

const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api'
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + API_PREFIX

/**
 * Your backend runs BOTH ResponseInterceptor and TransformInterceptor,
 * so every response is double-wrapped:
 *   { success, data: { success, data: <payload>, timestamp }, timestamp }
 *
 * This loop peels every wrapper layer until it reaches the real payload.
 */
const unwrap = (response) => {
  let body = response.data
  while (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    body = body.data
  }
  return body
}


export const userApi = axios.create({ baseURL: BASE_URL })

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

userApi.interceptors.response.use(
  (response) => ({ ...response, data: unwrap(response) }),
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)


export const adminApi = axios.create({ baseURL: BASE_URL })

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminApi.interceptors.response.use(
  (response) => ({ ...response, data: unwrap(response) }),
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_refresh_token')
      localStorage.removeItem('admin_data')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)


export const getErrorMessage = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  'Something went wrong'
