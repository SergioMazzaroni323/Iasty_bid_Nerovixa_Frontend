import api from './client'

export type WorkMode = 'remote' | 'hybrid' | 'on-site'
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary'

export type JobSortField =
  | 'job_title'
  | 'company_name'
  | 'industry'
  | 'work_mode'
  | 'employment_type'
  | 'salary_expected'
  | 'required_locations'
  | 'created_at'

export type SortOrder = 'asc' | 'desc'

export interface Job {
  id: number
  job_title: string
  company_name: string
  job_link: string | null
  job_description: string | null
  required_role: string | null
  required_locations: string | null
  work_mode: WorkMode
  employment_type: EmploymentType
  salary_expected: string | null
  industry: string | null
  is_real?: boolean
  created_at: string
  updated_at: string
}

export interface JobListResponse {
  items: Job[]
  total: number
  page: number
  page_size: number
}

export interface JobFilterOptions {
  companies: string[]
  industries: string[]
}

export interface ScrapeStatus {
  is_active: boolean
  remaining_in_queue: number
  imported_count: number
  total_templates: number
  available_templates: number
}

export interface ScrapeStopResponse {
  is_active: boolean
  real_jobs: Job[]
}

export interface ScrapeNextResponse {
  status: 'added' | 'completed' | 'stopped'
  job: Job | null
}

export interface JobListParams {
  search?: string
  company?: string
  industry?: string
  work_mode?: WorkMode | ''
  employment_type?: EmploymentType | ''
  location?: string
  is_real?: boolean
  sort_by?: JobSortField
  sort_order?: SortOrder
  page?: number
  page_size?: number
}

export const jobsApi = {
  list: (params: JobListParams = {}) =>
    api.get<JobListResponse>('/jobs', {
      params: Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== undefined),
      ),
    }),

  filterOptions: () => api.get<JobFilterOptions>('/jobs/filter-options'),

  scrapeStart: () => api.post<ScrapeStatus>('/jobs/scrape/start'),

  scrapeStop: () => api.post<ScrapeStopResponse>('/jobs/scrape/stop'),

  scrapeNext: () => api.post<ScrapeNextResponse>('/jobs/scrape/next'),

  scrapeStatus: () => api.get<ScrapeStatus>('/jobs/scrape/status'),
}

export const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
]

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
]

export const SORT_COLUMNS: { value: JobSortField; label: string }[] = [
  { value: 'job_title', label: 'Job title' },
  { value: 'company_name', label: 'Company' },
  { value: 'industry', label: 'Industry' },
  { value: 'work_mode', label: 'Work mode' },
  { value: 'employment_type', label: 'Employment type' },
  { value: 'salary_expected', label: 'Salary' },
  { value: 'required_locations', label: 'Location' },
  { value: 'created_at', label: 'Date added' },
]
