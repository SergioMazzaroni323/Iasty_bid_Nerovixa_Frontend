import type { DashboardStats, DailyCount, WorkModeStat } from '../api/dashboard'
import { jobsApi, type WorkMode } from '../api/jobs'

const WORK_MODES: WorkMode[] = ['remote', 'hybrid', 'on-site']
export const DASHBOARD_DAYS = 7

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function mixSeed(...parts: number[]) {
  let seed = 2166136261
  for (const part of parts) {
    seed ^= part + 0x9e3779b9 + (seed << 6) + (seed >> 2)
  }
  return seed >>> 0
}

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function generateDemoDailySeries(userSeed: number, days: number): { applications: DailyCount[]; resumes: DailyCount[] } {
  const applications: DailyCount[] = []
  const resumes: DailyCount[] = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const appliedPool = [31, 32, 33, 34, 35, 36, 37, 38, 39]

  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - (days - 1 - offset))
    const dayOrdinal = Math.floor(day.getTime() / 86_400_000)

    const appRng = seededRandom(mixSeed(userSeed, dayOrdinal, 101))
    const resRng = seededRandom(mixSeed(userSeed, dayOrdinal, 202))

    const applied = appliedPool[Math.floor(appRng() * appliedPool.length)]

    const gap = 2 + Math.floor(resRng() * 7)
    let resume = applied - gap
    if (resRng() > 0.55) {
      resume += Math.floor(resRng() * 3) - 1
    }
    resume = Math.max(1, Math.min(applied - 1, resume))

    applications.push({ date: dateKey(day), count: applied })
    resumes.push({ date: dateKey(day), count: resume })
  }

  return { applications, resumes }
}

async function loadWorkModeStats(): Promise<WorkModeStat[]> {
  const results = await Promise.all(
    WORK_MODES.map(async (work_mode) => {
      const { data } = await jobsApi.list({ work_mode, page: 1, page_size: 1 })
      return { work_mode, count: data.total }
    }),
  )
  return results
}

export async function buildDashboardStats(userSeed: number): Promise<DashboardStats> {
  const [{ data: jobsData }, work_modes] = await Promise.all([
    jobsApi.list({ page: 1, page_size: 1 }),
    loadWorkModeStats(),
  ])

  const { applications, resumes } = generateDemoDailySeries(userSeed, DASHBOARD_DAYS)

  return {
    total_jobs: jobsData.total,
    total_applications: applications.reduce((sum, item) => sum + item.count, 0),
    total_resumes: resumes.reduce((sum, item) => sum + item.count, 0),
    work_modes,
    applications_by_day: applications,
    resumes_by_day: resumes,
    days: DASHBOARD_DAYS,
  }
}

export { generateDemoDailySeries }
