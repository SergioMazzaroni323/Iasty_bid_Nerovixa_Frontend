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
