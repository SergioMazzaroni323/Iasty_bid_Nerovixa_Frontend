<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  EMPLOYMENT_TYPES,
  jobsApi,
  SORT_COLUMNS,
  WORK_MODES,
  type EmploymentType,
  type Job,
  type JobSortField,
  type ScrapeStatus,
  type SortOrder,
  type WorkMode,
} from '../api/jobs'

const jobs = ref<Job[]>([])
const total = ref(0)
const loading = ref(true)
const error = ref('')
const filtersOpen = ref(false)

const scraping = ref(false)
const scrapeMessage = ref('')
const scrapeStatus = ref<ScrapeStatus | null>(null)

const companies = ref<string[]>([])
const industries = ref<string[]>([])

const search = ref('')
const company = ref('')
const industry = ref('')
const workMode = ref<WorkMode | ''>('')
const employmentType = ref<EmploymentType | ''>('')
const location = ref('')
const sortBy = ref<JobSortField>('created_at')
const sortOrder = ref<SortOrder>('desc')
const page = ref(1)
const PAGE_SIZE = 10

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const activeFilterCount = computed(() => {
  let count = 0
  if (search.value) count++
  if (company.value) count++
  if (industry.value) count++
  if (workMode.value) count++
  if (employmentType.value) count++
  if (location.value) count++
  return count
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
let scrapeTimer: ReturnType<typeof setTimeout> | null = null

function randomScrapeDelay() {
  return 400 + Math.random() * 300
}

async function loadScrapeStatus() {
  const { data } = await jobsApi.scrapeStatus()
  scrapeStatus.value = data
}

async function loadFilterOptions() {
  const { data } = await jobsApi.filterOptions()
  companies.value = data.companies
  industries.value = data.industries
}

async function loadJobs() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await jobsApi.list({
      search: search.value || undefined,
      company: company.value || undefined,
      industry: industry.value || undefined,
      work_mode: workMode.value,
      employment_type: employmentType.value,
      location: location.value || undefined,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
      page: page.value,
      page_size: PAGE_SIZE,
    })
    jobs.value = data.items.slice(0, PAGE_SIZE)
    total.value = data.total
  } catch {
    error.value = 'Failed to load jobs. Please try again.'
  } finally {
    loading.value = false
  }
}

function prependJob(job: Job) {
  if (page.value === 1 && sortBy.value === 'created_at' && sortOrder.value === 'desc') {
    jobs.value.unshift(job)
    if (jobs.value.length > PAGE_SIZE) {
      jobs.value.pop()
    }
    total.value += 1
  } else {
    loadJobs()
  }
}

function scheduleScrapeNext() {
  if (!scraping.value) {
    return
  }
  scrapeTimer = setTimeout(async () => {
    if (!scraping.value) {
      return
    }
    try {
      const { data } = await jobsApi.scrapeNext()
      await loadScrapeStatus()

      if (data.status === 'added' && data.job) {
        prependJob(data.job)
        await loadFilterOptions()
        scrapeMessage.value = `Scraping… ${scrapeStatus.value?.imported_count ?? 0} jobs imported`
        scheduleScrapeNext()
        return
      }

      if (data.status === 'completed') {
        scrapeMessage.value = 'Scraping completed — all available jobs imported.'
      } else {
        scrapeMessage.value = 'Scraping stopped.'
      }
      scraping.value = false
      await loadJobs()
      await loadFilterOptions()
    } catch {
      error.value = 'Scraping failed. Please try again.'
      scraping.value = false
    }
  }, randomScrapeDelay())
}

async function startScraping() {
  error.value = ''
  try {
    const { data } = await jobsApi.scrapeStart()
    scrapeStatus.value = data
    scraping.value = true
    scrapeMessage.value = 'Scraping started…'
    scheduleScrapeNext()
  } catch {
    error.value = 'Failed to start scraping.'
  }
}

async function stopScraping() {
  scraping.value = false
  if (scrapeTimer) {
    clearTimeout(scrapeTimer)
    scrapeTimer = null
  }
  try {
    await jobsApi.scrapeStop()
    scrapeMessage.value = ''
    page.value = 1
    sortBy.value = 'created_at'
    sortOrder.value = 'desc'
    await loadJobs()
    await loadFilterOptions()
    await loadScrapeStatus()
  } catch {
    error.value = 'Failed to stop scraping.'
  }
}

function resetFilters() {
  search.value = ''
  company.value = ''
  industry.value = ''
  workMode.value = ''
  employmentType.value = ''
  location.value = ''
  sortBy.value = 'created_at'
  sortOrder.value = 'desc'
  page.value = 1
  loadJobs()
}

function toggleSort(column: JobSortField) {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  page.value = 1
  loadJobs()
}

function sortIcon(column: JobSortField) {
  if (sortBy.value !== column) {
    return '↕'
  }
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

function truncate(text: string | null, max = 80) {
  if (!text) {
    return '—'
  }
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function formatLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
}

watch([company, industry, workMode, employmentType, location, sortBy, sortOrder], () => {
  page.value = 1
  loadJobs()
})

watch(page, () => {
  loadJobs()
})

watch(search, () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    page.value = 1
    loadJobs()
  }, 300)
})

onMounted(async () => {
  await loadScrapeStatus()
  if (scrapeStatus.value?.is_active) {
    scraping.value = true
    scrapeMessage.value = 'Scraping in progress…'
    scheduleScrapeNext()
  }
  await loadFilterOptions()
  await loadJobs()
})

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  if (scrapeTimer) {
    clearTimeout(scrapeTimer)
  }
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-end gap-2 pb-3 sm:gap-3">
      <p
        v-if="scrapeMessage"
        class="hidden max-w-[16rem] truncate text-right text-xs text-slate-600 dark:text-slate-400 lg:block"
        :title="scrapeMessage"
      >
        {{ scrapeMessage }}
      </p>
      <button
        type="button"
        class="app-btn-scrape !px-3 !py-2 text-xs sm:!px-4 sm:!py-2.5 sm:text-sm"
        :disabled="scraping || scrapeStatus?.available_templates === 0"
        @click="startScraping"
      >
        <span v-if="scraping" class="app-spinner" />
        <span class="sm:hidden">{{ scraping ? 'Scraping…' : 'Scrape' }}</span>
        <span class="hidden sm:inline">{{ scraping ? 'Scraping…' : 'Scrape more jobs' }}</span>
      </button>
      <button
        v-if="scraping"
        type="button"
        class="app-btn-stop !px-3 !py-2 text-xs sm:!px-4 sm:!py-2.5 sm:text-sm"
        @click="stopScraping"
      >
        Stop
      </button>
    </div>

    <section class="app-card overflow-hidden !p-0">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6 sm:py-4">
          <div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">Job listings</h3>
            <p v-if="!loading" class="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{{ total }} job{{ total === 1 ? '' : 's' }} found</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition"
              :class="
                filtersOpen
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              "
              :aria-expanded="filtersOpen"
              aria-controls="jobs-filters-panel"
              @click="filtersOpen = !filtersOpen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h18M6 12h12M10 20h4" />
              </svg>
              Filters
              <span
                v-if="activeFilterCount > 0"
                class="app-filter-chip"
              >
                {{ activeFilterCount }}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-slate-400 transition-transform duration-200"
                :class="filtersOpen ? 'rotate-180' : ''"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              v-if="activeFilterCount > 0 || filtersOpen"
              type="button"
              class="app-btn-secondary"
              @click="resetFilters"
            >
              Reset
            </button>
          </div>
        </div>

        <div
          id="jobs-filters-panel"
          class="grid transition-[grid-template-rows] duration-200 ease-out"
          :class="filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <div class="space-y-4 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-6">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <label class="app-field">
                  <span>Search</span>
                  <input v-model="search" class="app-input w-full" type="text" placeholder="Title, company, role..." />
                </label>

                <label class="app-field">
                  <span>Company</span>
                  <select v-model="company" class="app-input w-full">
                    <option value="">All companies</option>
                    <option v-for="name in companies" :key="name" :value="name">{{ name }}</option>
                  </select>
                </label>

                <label class="app-field">
                  <span>Industry</span>
                  <select v-model="industry" class="app-input w-full">
                    <option value="">All industries</option>
                    <option v-for="name in industries" :key="name" :value="name">{{ name }}</option>
                  </select>
                </label>

                <label class="app-field">
                  <span>Work mode</span>
                  <select v-model="workMode" class="app-input w-full">
                    <option value="">All modes</option>
                    <option v-for="mode in WORK_MODES" :key="mode.value" :value="mode.value">{{ mode.label }}</option>
                  </select>
                </label>

                <label class="app-field">
                  <span>Employment type</span>
                  <select v-model="employmentType" class="app-input w-full">
                    <option value="">All types</option>
                    <option v-for="type in EMPLOYMENT_TYPES" :key="type.value" :value="type.value">{{ type.label }}</option>
                  </select>
                </label>

                <label class="app-field">
                  <span>Location</span>
                  <input v-model="location" class="app-input w-full" type="text" placeholder="City, state, remote..." />
                </label>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label class="app-field">
                  <span>Sort by</span>
                  <select v-model="sortBy" class="app-input w-full">
                    <option v-for="col in SORT_COLUMNS" :key="col.value" :value="col.value">{{ col.label }}</option>
                  </select>
                </label>

                <label class="app-field">
                  <span>Order</span>
                  <select v-model="sortOrder" class="app-input w-full">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>

        <p v-if="error" class="auth-error px-4 py-3 sm:px-6">{{ error }}</p>

        <!-- Mobile card list -->
        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 bg-white px-4 py-16 dark:bg-slate-900 md:hidden">
          <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
          <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Loading jobs…</p>
        </div>

        <div v-else-if="jobs.length === 0" class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400 md:hidden">
          No jobs match your filters.
        </div>

        <div v-else class="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900 md:hidden">
          <article v-for="job in jobs" :key="job.id" class="app-job-card">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="font-semibold text-slate-900 dark:text-slate-100">{{ job.job_title }}</h4>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ job.company_name }}</p>
              </div>
              <a
                v-if="job.job_link"
                :href="job.job_link"
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
              >
                Open
              </a>
            </div>

            <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ truncate(job.job_description, 120) }}</p>

            <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <dt class="text-slate-400 dark:text-slate-500">Role</dt>
                <dd class="font-medium text-slate-700 dark:text-slate-300">{{ job.required_role || '—' }}</dd>
              </div>
              <div>
                <dt class="text-slate-400 dark:text-slate-500">Salary</dt>
                <dd class="font-medium text-slate-700 dark:text-slate-300">{{ job.salary_expected || '—' }}</dd>
              </div>
              <div class="col-span-2">
                <dt class="text-slate-400 dark:text-slate-500">Location</dt>
                <dd class="font-medium text-slate-700 dark:text-slate-300">{{ job.required_locations || '—' }}</dd>
              </div>
              <div>
                <dt class="text-slate-400 dark:text-slate-500">Industry</dt>
                <dd class="font-medium text-slate-700 dark:text-slate-300">{{ job.industry || '—' }}</dd>
              </div>
            </dl>

            <div class="mt-3 flex flex-wrap gap-2">
              <span class="app-badge">{{ formatLabel(job.work_mode) }}</span>
              <span class="app-badge app-badge-muted">{{ formatLabel(job.employment_type) }}</span>
            </div>
          </article>
        </div>

        <!-- Desktop table -->
        <div class="hidden overflow-x-auto bg-white dark:bg-slate-900 md:block">
          <table class="app-table">
            <thead>
              <tr>
                <th><button type="button" class="app-sort-btn" @click="toggleSort('job_title')">Job title {{ sortIcon('job_title') }}</button></th>
                <th><button type="button" class="app-sort-btn" @click="toggleSort('company_name')">Company {{ sortIcon('company_name') }}</button></th>
                <th>Job link</th>
                <th>Description</th>
                <th>Required role</th>
                <th><button type="button" class="app-sort-btn" @click="toggleSort('required_locations')">Locations {{ sortIcon('required_locations') }}</button></th>
                <th><button type="button" class="app-sort-btn" @click="toggleSort('work_mode')">Work mode {{ sortIcon('work_mode') }}</button></th>
                <th><button type="button" class="app-sort-btn" @click="toggleSort('employment_type')">Type {{ sortIcon('employment_type') }}</button></th>
                <th><button type="button" class="app-sort-btn" @click="toggleSort('salary_expected')">Salary {{ sortIcon('salary_expected') }}</button></th>
                <th><button type="button" class="app-sort-btn" @click="toggleSort('industry')">Industry {{ sortIcon('industry') }}</button></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="10" class="bg-white px-6 py-16 text-center dark:bg-slate-900">
                  <div class="flex flex-col items-center justify-center gap-3">
                    <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Loading jobs…</p>
                  </div>
                </td>
              </tr>
              <tr v-else-if="jobs.length === 0">
                <td colspan="10" class="bg-white px-6 py-10 text-center text-slate-500 dark:bg-slate-900 dark:text-slate-400">No jobs match your filters.</td>
              </tr>
              <template v-else>
                <tr v-for="job in jobs" :key="job.id" class="bg-white transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800">
                <td class="max-w-[200px] font-medium text-slate-900 dark:text-slate-100">
                  {{ job.job_title }}
                </td>
                <td>{{ job.company_name }}</td>
                <td>
                  <a
                    v-if="job.job_link"
                    :href="job.job_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Open
                  </a>
                  <span v-else>—</span>
                </td>
                <td class="max-w-[240px] whitespace-normal text-slate-600 dark:text-slate-400" :title="job.job_description ?? undefined">{{ truncate(job.job_description, 60) }}</td>
                <td>{{ job.required_role || '—' }}</td>
                <td class="max-w-[180px] whitespace-normal">{{ job.required_locations || '—' }}</td>
                <td><span class="app-badge">{{ formatLabel(job.work_mode) }}</span></td>
                <td><span class="app-badge app-badge-muted">{{ formatLabel(job.employment_type) }}</span></td>
                <td>{{ job.salary_expected || '—' }}</td>
                <td>{{ job.industry || '—' }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div
          v-if="totalPages > 1"
          class="flex flex-col items-stretch gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
        >
          <button type="button" class="app-btn-secondary order-2 sm:order-1" :disabled="page <= 1" @click="page--">
            Previous
          </button>
          <span class="order-1 text-center text-sm text-slate-600 dark:text-slate-400 sm:order-2">Page {{ page }} of {{ totalPages }}</span>
          <button type="button" class="app-btn-secondary order-3" :disabled="page >= totalPages" @click="page++">
            Next
          </button>
        </div>
      </section>
  </div>
</template>
