<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { adminApi, type AdminUser, type UserStatus } from '../api/admin'
import { authApi } from '../api/client'

const router = useRouter()
const users = ref<AdminUser[]>([])
const loading = ref(false)
const error = ref('')
const actionMessage = ref('')
const busyId = ref<number | null>(null)

async function ensureAdmin() {
  const { data } = await authApi.me()
  if (data.role !== 'admin' && data.email.toLowerCase() !== 'hoyosnohor@gmail.com') {
    await router.replace({ name: 'home' })
    return false
  }
  return true
}

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await adminApi.listUsers()
    users.value = data.items
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } } }
    error.value = err.response?.data?.detail ?? 'Failed to load users.'
  } finally {
    loading.value = false
  }
}

async function setStatus(user: AdminUser, status: UserStatus) {
  busyId.value = user.id
  actionMessage.value = ''
  error.value = ''
  try {
    const { data } = await adminApi.updateStatus(user.id, status)
    users.value = users.value.map((item) => (item.id === user.id ? data : item))
    actionMessage.value = `${user.email} is now ${status}.`
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } } }
    error.value = err.response?.data?.detail ?? 'Failed to update status.'
  } finally {
    busyId.value = null
  }
}

async function resetPassword(user: AdminUser) {
  const password = window.prompt(
    `Set a temporary password for ${user.email} (min 8 chars).\nLeave blank to email a reset link instead.`,
  )
  if (password === null) return

  const trimmed = password.trim()
  if (trimmed && trimmed.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  busyId.value = user.id
  actionMessage.value = ''
  error.value = ''
  try {
    const { data } = await adminApi.resetPassword(user.id, trimmed || undefined)
    actionMessage.value = data.message
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } } }
    error.value = err.response?.data?.detail ?? 'Failed to reset password.'
  } finally {
    busyId.value = null
  }
}

async function removeAccount(user: AdminUser) {
  if (!window.confirm(`Remove account ${user.email}? This cannot be undone.`)) return

  busyId.value = user.id
  actionMessage.value = ''
  error.value = ''
  try {
    const { data } = await adminApi.removeUser(user.id)
    users.value = users.value.filter((item) => item.id !== user.id)
    actionMessage.value = data.message
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } } }
    error.value = err.response?.data?.detail ?? 'Failed to remove account.'
  } finally {
    busyId.value = null
  }
}

function statusClass(status: UserStatus) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50'
  if (status === 'pending') return 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/50'
  return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
}

onMounted(async () => {
  try {
    if (!(await ensureAdmin())) return
    await loadUsers()
  } catch {
    localStorage.removeItem('access_token')
    await router.push({ name: 'login' })
  }
})
</script>

<template>
  <AppLayout>
    <div class="space-y-4 sm:space-y-6">
      <section class="app-card">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="app-card-title">User management</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Approve, deactivate, reset passwords, or remove accounts.
            </p>
          </div>
          <button type="button" class="app-btn-secondary" :disabled="loading" @click="loadUsers">
            Refresh
          </button>
        </div>
      </section>

      <p v-if="error" class="auth-error">{{ error }}</p>
      <p v-if="actionMessage" class="text-sm font-medium text-emerald-600 dark:text-emerald-400">{{ actionMessage }}</p>

      <section class="app-card overflow-hidden !p-0">
        <div class="overflow-x-auto">
          <table class="app-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Reset password</th>
                <th>Remove account</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">Loading users…</td>
              </tr>
              <tr v-else-if="users.length === 0">
                <td colspan="7" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">No users found.</td>
              </tr>
              <tr v-for="(user, index) in users" :key="user.id" class="align-middle">
                <td class="font-medium text-slate-900 dark:text-slate-100">{{ index + 1 }}</td>
                <td>
                  <div class="font-medium text-slate-900 dark:text-slate-100">{{ user.email }}</div>
                  <div class="text-xs text-slate-400">#{{ user.id }}</div>
                </td>
                <td>
                  <span class="app-badge" :class="user.role === 'admin' ? 'app-badge-real' : ''">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span class="text-sm font-medium" :class="user.is_verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
                    {{ user.is_verified ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <div class="flex flex-col gap-2">
                    <span
                      class="inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                      :class="statusClass(user.status)"
                    >
                      {{ user.status }}
                    </span>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        v-if="user.status !== 'active'"
                        type="button"
                        class="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                        :disabled="busyId === user.id || !user.is_verified"
                        @click="setStatus(user, 'active')"
                      >
                        Approve
                      </button>
                      <button
                        v-if="user.status !== 'deactive'"
                        type="button"
                        class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        :disabled="busyId === user.id || user.role === 'admin'"
                        @click="setStatus(user, 'deactive')"
                      >
                        Deactivate
                      </button>
                      <button
                        v-if="user.status === 'deactive'"
                        type="button"
                        class="rounded-lg border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:border-amber-900/50 dark:text-amber-300"
                        :disabled="busyId === user.id"
                        @click="setStatus(user, 'pending')"
                      >
                        Set pending
                      </button>
                    </div>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    class="app-btn-secondary !px-2.5 !py-1.5 text-xs"
                    :disabled="busyId === user.id"
                    @click="resetPassword(user)"
                  >
                    Reset
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    class="rounded-xl border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                    :disabled="busyId === user.id || user.role === 'admin'"
                    @click="removeAccount(user)"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
