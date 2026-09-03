import type { DashboardStats, DailyCount, WorkModeStat } from '../api/dashboard'
import { jobsApi, type WorkMode } from '../api/jobs'

const WORK_MODES: WorkMode[] = ['remote', 'hybrid', 'on-site']
const DASHBOARD_DAYS = 14

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10)
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

  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - (days - 1 - offset))
    const dayOrdinal = Math.floor(day.getTime() / 86_400_000)
    const rng = seededRandom(userSeed * 10_000 + dayOrdinal)

    const applied = 60 + Math.floor(rng() * 21)
    const resumeRatio = 0.85 + rng() * 0.12
    const resume = Math.max(1, Math.min(applied - 1, Math.round(applied * resumeRatio)))

    const date = dateKey(day)
    applications.push({ date, count: applied })
    resumes.push({ date, count: resume })
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
