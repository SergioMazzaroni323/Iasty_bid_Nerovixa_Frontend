<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchCurrentUser, getCachedUser } from '../auth/session'
import type { UserResponse } from '../api/client'
import { dashboardApi, type DashboardStats } from '../api/dashboard'
import WorkModeDonut from '../components/dashboard/WorkModeDonut.vue'
import DailyBarChart from '../components/dashboard/DailyBarChart.vue'

const user = ref<UserResponse | null>(getCachedUser())
const stats = ref<DashboardStats | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    user.value = await fetchCurrentUser()
    const { data } = await dashboardApi.stats()
    stats.value = data
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

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="app-stat">
        <p class="app-stat-label">Total jobs</p>
        <p class="app-stat-value">{{ loading ? '—' : (stats?.total_jobs ?? 0) }}</p>
      </div>
      <div class="app-stat">
        <p class="app-stat-label">Applied jobs</p>
        <p class="app-stat-value">{{ loading ? '—' : (stats?.total_applications ?? 0) }}</p>
      </div>
      <div class="app-stat">
        <p class="app-stat-label">Tailored resumes</p>
        <p class="app-stat-value">{{ loading ? '—' : (stats?.total_resumes ?? 0) }}</p>
      </div>
      <div class="app-stat">
        <p class="app-stat-label">Pipeline</p>
        <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Track work modes, daily applications, and resume tailoring from your job hunt.
        </p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <section class="app-card lg:col-span-1">
        <h3 class="app-card-title">Jobs by work mode</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Remote, hybrid, and on-site split</p>
        <div class="mt-6">
          <div v-if="loading" class="flex h-44 items-center justify-center">
            <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
          </div>
          <WorkModeDonut v-else-if="stats" :items="stats.work_modes" />
        </div>
      </section>

      <section class="app-card lg:col-span-1">
        <h3 class="app-card-title">Applied jobs</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Last {{ stats?.days ?? 14 }} days</p>
        <div class="mt-6">
          <div v-if="loading" class="flex h-48 items-center justify-center">
            <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
          </div>
          <DailyBarChart
            v-else-if="stats"
            :items="stats.applications_by_day"
            color="#6366f1"
            empty-label="Applications will appear here when you submit jobs"
          />
        </div>
      </section>

      <section class="app-card lg:col-span-1">
        <h3 class="app-card-title">Tailored resumes</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Last {{ stats?.days ?? 14 }} days</p>
        <div class="mt-6">
          <div v-if="loading" class="flex h-48 items-center justify-center">
            <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
          </div>
          <DailyBarChart
            v-else-if="stats"
            :items="stats.resumes_by_day"
            color="#8b5cf6"
            empty-label="Resume generations will appear here from the extension"
          />
        </div>
      </section>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <section class="app-card lg:col-span-2">
        <h3 class="app-card-title">Welcome back</h3>
        <p v-if="user" class="mt-2 text-slate-600 dark:text-slate-400">
          Signed in as <strong class="text-slate-800 dark:text-slate-200">{{ user.email }}</strong>
        </p>
        <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Browse your job pipeline, filter by company and location, and scrape more listings from the Jobs page.
        </p>
        <RouterLink to="/jobs" class="app-btn-primary mt-5">View jobs</RouterLink>
      </section>

      <section class="app-card">
        <h3 class="app-card-title">Quick links</h3>
        <div class="mt-4 space-y-1">
          <RouterLink to="/jobs" class="app-link-row">Jobs table</RouterLink>
          <RouterLink to="/settings" class="app-link-row">Settings</RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>
