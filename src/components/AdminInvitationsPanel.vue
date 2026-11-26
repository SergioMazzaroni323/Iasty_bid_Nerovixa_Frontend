<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { apiErrorMessage, formatLongDate, invitationsApi, type AdminInvitation } from '../api/invitations'

const invitations = ref<AdminInvitation[]>([])
const loading = ref(false)
const error = ref('')
const expandedId = ref<string | null>(null)

// Object URLs for photos, loaded on demand (photos need the auth header, so no plain <img src>)
const photoUrls = reactive<Record<string, string>>({})
const photoErrors = reactive<Record<string, string>>({})

async function loadInvitations() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await invitationsApi.adminList()
    invitations.value = data.items
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Failed to load invitations.')
  } finally {
    loading.value = false
  }
}

async function loadPhotos(invite: AdminInvitation) {
  for (const n of [1, 2] as const) {
    const key = `${invite.id}:${n}`
    if (photoUrls[key]) continue
    try {
      const { data } = await invitationsApi.adminPhoto(invite.id, n)
      photoUrls[key] = URL.createObjectURL(data)
    } catch {
      photoErrors[key] = 'Failed to load photo'
    }
  }
}

function toggle(invite: AdminInvitation) {
  expandedId.value = expandedId.value === invite.id ? null : invite.id
  if (expandedId.value && invite.onboarding) {
    loadPhotos(invite)
  }
}

function statusClass(status: AdminInvitation['status']) {
  if (status === 'submitted') return 'app-badge-real'
  if (status === 'cancelled') return 'app-badge-muted'
  return ''
}

function formatDateTime(value: string | null) {
  return value ? new Date(`${value}Z`).toLocaleString() : '—'
}

onMounted(loadInvitations)

onBeforeUnmount(() => {
  Object.values(photoUrls).forEach((url) => URL.revokeObjectURL(url))
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="app-card-title">Invited jobs</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every invitation, its status, and the candidate's onboarding details and photos.
        </p>
      </div>
      <button type="button" class="app-btn-secondary" :disabled="loading" @click="loadInvitations">Refresh</button>
    </div>

    <p v-if="error" class="auth-error">{{ error }}</p>

    <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="overflow-x-auto">
        <table class="app-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">Loading invitations…</td>
            </tr>
            <tr v-else-if="invitations.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">No invitations yet.</td>
            </tr>
            <template v-else>
            <template v-for="invite in invitations" :key="invite.id">
              <tr class="align-middle">
                <td class="font-medium text-slate-900 dark:text-slate-100">{{ invite.user_email }}</td>
                <td>{{ invite.job.company_name }}</td>
                <td>{{ invite.job.required_role }}</td>
                <td><span class="app-badge" :class="statusClass(invite.status)">{{ invite.status }}</span></td>
                <td>{{ formatDateTime(invite.onboarding?.submitted_at ?? null) }}</td>
                <td class="text-right">
                  <button
                    type="button"
                    class="app-btn-secondary !px-2.5 !py-1.5 text-xs"
                    :aria-expanded="expandedId === invite.id"
                    @click="toggle(invite)"
                  >
                    {{ expandedId === invite.id ? 'Hide' : 'Details' }}
                  </button>
                </td>
              </tr>
              <tr v-if="expandedId === invite.id">
                <td colspan="6" class="!whitespace-normal bg-slate-50/70 dark:bg-slate-950/40">
                  <div class="grid gap-6 py-2 lg:grid-cols-2">
                    <dl class="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      <div><dt class="text-xs uppercase text-slate-400">Invite ID</dt><dd class="break-all font-mono text-xs">{{ invite.id }}</dd></div>
                      <div><dt class="text-xs uppercase text-slate-400">Pay rate</dt><dd>{{ invite.job.pay_rate }}</dd></div>
                      <div><dt class="text-xs uppercase text-slate-400">Manager</dt><dd>{{ invite.job.manager }}</dd></div>
                      <div><dt class="text-xs uppercase text-slate-400">Type</dt><dd>{{ invite.job.employment_type }}</dd></div>
                      <div><dt class="text-xs uppercase text-slate-400">Start date</dt><dd>{{ formatLongDate(invite.job.start_date) }}</dd></div>
                      <div><dt class="text-xs uppercase text-slate-400">End date</dt><dd>{{ formatLongDate(invite.job.end_date) }}</dd></div>

                      <template v-if="invite.onboarding">
                        <div><dt class="text-xs uppercase text-slate-400">Name</dt><dd>{{ invite.onboarding.first_name }} {{ invite.onboarding.last_name }}</dd></div>
                        <div><dt class="text-xs uppercase text-slate-400">Birthday</dt><dd>{{ formatLongDate(invite.onboarding.birthday) }}</dd></div>
                        <div><dt class="text-xs uppercase text-slate-400">Phone</dt><dd>{{ invite.onboarding.phone }}</dd></div>
                        <div><dt class="text-xs uppercase text-slate-400">Email</dt><dd class="break-all">{{ invite.onboarding.email }}</dd></div>
                        <div class="sm:col-span-2"><dt class="text-xs uppercase text-slate-400">Address</dt><dd>{{ invite.onboarding.address }}</dd></div>
                        <div class="sm:col-span-2">
                          <dt class="text-xs uppercase text-slate-400">Website</dt>
                          <dd class="break-all">
                            <a
                              v-if="invite.onboarding.website"
                              :href="invite.onboarding.website"
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              class="auth-link"
                            >{{ invite.onboarding.website }}</a>
                            <span v-else>—</span>
                          </dd>
                        </div>
                      </template>
                      <p v-else class="text-sm text-slate-500 sm:col-span-2">The candidate hasn't submitted onboarding yet.</p>
                    </dl>

                    <div v-if="invite.onboarding" class="grid grid-cols-2 gap-3">
                      <figure v-for="n in [1, 2]" :key="n" class="space-y-1">
                        <div class="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                          <a v-if="photoUrls[`${invite.id}:${n}`]" :href="photoUrls[`${invite.id}:${n}`]" target="_blank" rel="noopener">
                            <img :src="photoUrls[`${invite.id}:${n}`]" :alt="`Photo ${n}`" class="h-full w-full object-cover" />
                          </a>
                          <span v-else class="text-xs text-slate-400">{{ photoErrors[`${invite.id}:${n}`] || 'Loading…' }}</span>
                        </div>
                        <figcaption class="text-center text-xs text-slate-500">{{ n === 1 ? 'First photo' : 'Second photo' }}</figcaption>
                      </figure>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
