import api from './client'
import type { WorkMode } from './jobs'

export interface WorkModeStat {
  work_mode: WorkMode
  count: number
}

export interface DailyCount {
  date: string
  count: number
}

export interface DashboardStats {
  total_jobs: number
  total_applications: number
  total_resumes: number
  work_modes: WorkModeStat[]
  applications_by_day: DailyCount[]
  resumes_by_day: DailyCount[]
  days: number
}

export type ActivityType = 'application' | 'resume'

export interface ActivityCreatePayload {
  activity_type: ActivityType
  job_title?: string
  company_name?: string
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),

  logActivity: (payload: ActivityCreatePayload) =>
    api.post<{ id: number; created_at: string }>('/dashboard/activities', payload),
}
