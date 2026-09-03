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

export const adminApi = {
  listUsers: () => api.get<AdminUserListResponse>('/admin/users'),

  updateStatus: (userId: number, status: UserStatus) =>
    api.patch<AdminUser>(`/admin/users/${userId}/status`, { status }),

  resetPassword: (userId: number, password?: string) =>
    api.post<{ message: string }>(
      `/admin/users/${userId}/reset-password`,
      password ? { password } : {},
    ),

  removeUser: (userId: number) =>
    api.delete<{ message: string }>(`/admin/users/${userId}`),
}
