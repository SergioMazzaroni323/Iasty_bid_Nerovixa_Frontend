<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { authApi, type UserResponse } from '../api/client'
import { jobsApi } from '../api/jobs'

const router = useRouter()
const user = ref<UserResponse | null>(null)
const totalJobs = ref<number | null>(null)
const submittedProposals = ref(0)

onMounted(async () => {
  try {
    const { data } = await authApi.me()
    user.value = data

    const { data: jobsData } = await jobsApi.list({ page: 1, page_size: 1 })
    totalJobs.value = jobsData.total
  } catch {
    localStorage.removeItem('access_token')
    await router.push({ name: 'login' })
  }
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="app-stat">
          <p class="app-stat-label">Total jobs</p>
          <p class="app-stat-value">{{ totalJobs ?? '—' }}</p>
        </div>
        <div class="app-stat">
          <p class="app-stat-label">Submitted proposals</p>
          <p class="app-stat-value">{{ submittedProposals }}</p>
        </div>
        <div class="app-stat sm:col-span-2">
          <p class="app-stat-label">Pipeline</p>
          <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Your account starts with ~243 curated jobs. Filter, sort, and scrape more from the template pool.
          </p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <section class="app-card lg:col-span-2">
          <h3 class="app-card-title">Welcome back</h3>
          <p v-if="user" class="mt-2 text-slate-600 dark:text-slate-400">
            Signed in as <strong class="text-slate-800 dark:text-slate-200">{{ user.email }}</strong>
          </p>
          <p class="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Track job postings, filter by company and location, and sort your pipeline from the Jobs page.
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
  </AppLayout>
</template>
