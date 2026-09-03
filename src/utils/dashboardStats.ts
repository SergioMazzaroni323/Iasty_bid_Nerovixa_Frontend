import type { DashboardStats, DailyCount, WorkModeStat } from '../api/dashboard'
import { jobsApi, type WorkMode } from '../api/jobs'

const WORK_MODES: WorkMode[] = ['remote', 'hybrid', 'on-site']
export const DASHBOARD_DAYS = 7

const APPLIED_MIN = 31
const APPLIED_MAX = 39

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

function weekSeed(userSeed: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const week = Math.floor((now.getTime() - start.getTime()) / (7 * 86_400_000))
  return mixSeed(userSeed, week, now.getFullYear())
}

function shuffle<T>(items: T[], rng: () => number) {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function generateAppliedCounts(rng: () => number, days: number): number[] {
  const pool = Array.from({ length: APPLIED_MAX - APPLIED_MIN + 1 }, (_, i) => APPLIED_MIN + i)
  const shuffled = shuffle(pool, rng)
  const values: number[] = []

  for (let i = 0; i < days; i += 1) {
    if (i < shuffled.length) {
      values.push(shuffled[i])
      continue
    }

    const prev = values[i - 1]
    let next = prev
    for (let attempt = 0; attempt < 12 && next === prev; attempt += 1) {
      const delta = Math.floor(rng() * 7) - 3
      next = clamp(prev + delta, APPLIED_MIN, APPLIED_MAX)
    }
    values.push(next)
  }

  for (let i = 1; i < values.length; i += 1) {
    if (values[i] === values[i - 1]) {
      const bump = rng() > 0.5 ? 1 : -1
      values[i] = clamp(values[i] + bump, APPLIED_MIN, APPLIED_MAX)
    }
  }

  return values
}

function generateResumeCounts(applied: number[], rng: () => number): number[] {
  return applied.map((count) => {
    const gap = 2 + Math.floor(rng() * 6)
    const jitter = Math.floor(rng() * 5) - 2
    return clamp(count - gap + jitter, 1, count - 1)
  })
}

function generateDemoDailySeries(userSeed: number, days: number): { applications: DailyCount[]; resumes: DailyCount[] } {
  const rng = seededRandom(weekSeed(userSeed))
  const resRng = seededRandom(weekSeed(userSeed) ^ 0xabcdef)

  const appliedCounts = generateAppliedCounts(rng, days)
  const resumeCounts = generateResumeCounts(appliedCounts, resRng)

  const applications: DailyCount[] = []
  const resumes: DailyCount[] = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - (days - 1 - offset))
    applications.push({ date: dateKey(day), count: appliedCounts[offset] })
    resumes.push({ date: dateKey(day), count: resumeCounts[offset] })
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
