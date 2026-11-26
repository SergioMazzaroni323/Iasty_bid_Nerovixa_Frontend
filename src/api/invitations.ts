import api from './client'

export type InvitationStatus = 'invited' | 'submitted' | 'cancelled'

export interface InvitedJob {
  company_name: string
  required_role: string
  pay_rate: string
  manager: string
  employment_type: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
}

export interface Invitation {
  id: string // unique id used in /onboarding/:id
  status: InvitationStatus
  job: InvitedJob
}

export interface OnboardingDetails {
  first_name: string
  last_name: string
  birthday: string
  phone: string
  email: string
  address: string
  website: string | null
  submitted_at: string | null
}

export interface AdminInvitation extends Invitation {
  user_id: number
  user_email: string
  created_at: string | null
  onboarding: OnboardingDetails | null
}

export interface OnboardingPayload {
  first_name: string
  last_name: string
  birthday: string
  phone: string
  email: string
  address: string
  website?: string
  photo1: File
  photo2: File
}

export const invitationsApi = {
  list: () => api.get<Invitation[]>('/invitations'),

  get: (id: string) => api.get<Invitation>(`/invitations/${encodeURIComponent(id)}`),

  cancel: (id: string) => api.post<Invitation>(`/invitations/${encodeURIComponent(id)}/cancel`),

  submitOnboarding: (id: string, payload: OnboardingPayload) => {
    const form = new FormData()
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === '') continue
      form.append(key, value)
    }
    // Must override the client's JSON default (axios would otherwise serialize FormData to JSON);
    // in the browser axios then drops this header so the multipart boundary is added automatically

    return api.post<{ message: string }>(`/invitations/${encodeURIComponent(id)}/onboarding`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  adminList: () => api.get<{ items: AdminInvitation[]; total: number }>('/admin/invitations'),

  adminPhoto: (id: string, photoNumber: 1 | 2) =>
    api.get<Blob>(`/admin/invitations/${encodeURIComponent(id)}/photos/${photoNumber}`, { responseType: 'blob' }),
}

/** "2026-11-25" -> "November 25th, 2026" (parsed as a calendar date, no timezone shift). */
export function formatLongDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })
  const suffix =
    day % 100 >= 11 && day % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] ?? 'th'
  return `${monthName} ${day}${suffix}, ${year}`
}

export function apiErrorMessage(error: unknown, fallback: string) {
  const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (item && typeof item === 'object' && 'msg' in item ? String((item as { msg: unknown }).msg) : String(item)))
      .join('; ')
  }
  return fallback
}
