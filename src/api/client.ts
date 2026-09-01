import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface MessageResponse {
  message: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: number
  email: string
  is_verified: boolean
}

export const authApi = {
  register: (email: string, password: string) =>
    api.post<MessageResponse>('/auth/register', { email, password }),

  verifyEmail: (token: string) =>
    api.get<MessageResponse>('/auth/verify-email', { params: { token } }),

  login: (email: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { email, password }),

  forgotPassword: (email: string) =>
    api.post<MessageResponse>('/auth/forgot-password', { email }),

  resendVerification: (email: string) =>
    api.post<MessageResponse>('/auth/resend-verification', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<MessageResponse>('/auth/reset-password', { token, password }),

  me: () => api.get<UserResponse>('/auth/me'),
}

export default api
