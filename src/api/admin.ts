import api from './client'
import type { UserResponse } from './client'

export type UserRole = 'admin' | 'user'
export type UserStatus = 'pending' | 'active' | 'deactive'

export interface AdminUser extends UserResponse {
  role: UserRole
  status: UserStatus
  created_at?: string | null
}

export interface AdminUserListResponse {
  items: AdminUser[]
  total: number
}

function detailMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { detail?: unknown } } }
  const detail = err.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === 'object' && item && 'msg' in item ? String((item as { msg: string }).msg) : String(item)))
      .join('; ')
  }
  return fallback
}

export const adminApi = {
  listUsers: () => api.get<AdminUserListResponse>('/admin/users'),

  updateStatus: (userId: number, status: UserStatus) =>
    api.post<AdminUser>(`/admin/users/${userId}/status`, { status }),

  resetPassword: (userId: number, password?: string) =>
    api.post<{ message: string }>(
      `/admin/users/${userId}/reset-password`,
      password ? { password } : {},
    ),

  removeUser: (userId: number) =>
    api.delete<{ message: string }>(`/admin/users/${userId}`),

  detailMessage,
}
