<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchCurrentUser, getCachedUser } from '../auth/session'
import type { UserResponse } from '../api/client'
import type { DashboardStats } from '../api/dashboard'
import { buildDashboardStats } from '../utils/dashboardStats'

import WorkModeDonut from '../components/dashboard/WorkModeDonut.vue'
import DailyLineChart from '../components/dashboard/DailyLineChart.vue'

const user = ref<UserResponse | null>(getCachedUser())
const stats = ref<DashboardStats | null>(null)
const loading = ref(true)
const error = ref('')

async function loadStats(currentUser: UserResponse) {
  stats.value = await buildDashboardStats(currentUser.id)
}

onMounted(async () => {
  try {
    const currentUser = await fetchCurrentUser()
    user.value = currentUser
    await loadStats(currentUser)
  } catch {
    error.value = 'Failed to load dashboard stats.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="error" class="auth-error">{{ error }}</div>

    <section class="app-card flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h3 class="app-card-title">Welcome back</h3>
        <p v-if="user" class="mt-2 text-slate-600 dark:text-slate-400">
          Signed in as <strong class="text-slate-800 dark:text-slate-200">{{ user.email }}</strong>
        </p>
        <p class="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Browse your job pipeline, filter by company and location, and scrape more listings from the Jobs page.
        </p>
      </div>
      <RouterLink to="/jobs" class="app-btn-primary shrink-0 self-start sm:self-center">View jobs</RouterLink>
    </section>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="app-stat flex min-h-[8.5rem] flex-col justify-center">
        <p class="app-stat-label">Total jobs</p>
        <p class="app-stat-value">{{ loading ? '—' : (stats?.total_jobs ?? 0) }}</p>
      </div>
      <div class="app-stat flex min-h-[8.5rem] flex-col justify-center">
        <p class="app-stat-label">Applied jobs</p>
        <p class="app-stat-value">{{ loading ? '—' : (stats?.total_applications ?? 0) }}</p>
      </div>
      <div class="app-stat flex min-h-[8.5rem] flex-col justify-center">
        <p class="app-stat-label">Tailored resumes</p>
        <p class="app-stat-value">{{ loading ? '—' : (stats?.total_resumes ?? 0) }}</p>
      </div>
      <div class="app-stat flex min-h-[8.5rem] flex-col justify-center">
        <p class="app-stat-label">Pipeline</p>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Track work modes, daily applications, and resume tailoring from your job hunt.
        </p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <section class="app-card flex min-h-[22rem] flex-col">
        <h3 class="app-card-title">Jobs by work mode</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Remote, hybrid, and on-site split</p>
        <div class="mt-6 flex flex-1 items-center justify-center">
          <div v-if="loading" class="flex h-56 w-full items-center justify-center">
            <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
          </div>
          <WorkModeDonut v-else-if="stats" :items="stats.work_modes" />
        </div>
      </section>

      <section class="app-card flex min-h-[22rem] flex-col">
        <h3 class="app-card-title">Applied jobs</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Last {{ stats?.days ?? 7 }} days</p>
        <div class="mt-6 flex flex-1 items-end">
          <div v-if="loading" class="flex h-56 w-full items-center justify-center">
            <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
          </div>
          <DailyLineChart
            v-else-if="stats"
            class="w-full"
            :items="stats.applications_by_day"
            color="#6366f1"
            :min-y="25"
            :max-y="45"
          />
        </div>
      </section>

      <section class="app-card flex min-h-[22rem] flex-col">
        <h3 class="app-card-title">Tailored resumes</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Last {{ stats?.days ?? 7 }} days</p>
        <div class="mt-6 flex flex-1 items-end">
          <div v-if="loading" class="flex h-56 w-full items-center justify-center">
            <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
          </div>
          <DailyLineChart
            v-else-if="stats"
            class="w-full"
            :items="stats.resumes_by_day"
            color="#8b5cf6"
            :min-y="20"
            :max-y="40"
          />
        </div>
      </section>
    </div>
  </div>
</template>
