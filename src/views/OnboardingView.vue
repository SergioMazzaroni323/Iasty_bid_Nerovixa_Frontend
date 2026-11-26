<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { apiErrorMessage, formatLongDate, invitationsApi, type Invitation } from '../api/invitations'

type Slot = 'first' | 'second'

const MAX_PHOTO_MB = 8
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const route = useRoute()
const inviteId = route.params.id as string

const invite = ref<Invitation | null>(null)
const loading = ref(true)
const loadError = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  birthday: '',
  phone: '',
  email: '',
  address: '',
  website: '',
})

interface PhotoSlot {
  file: File | null
  preview: string
}

const photos = reactive<Record<Slot, PhotoSlot>>({
  first: { file: null, preview: '' },
  second: { file: null, preview: '' },
})
const photoSlots: { key: Slot; label: string }[] = [
  { key: 'first', label: 'First one' },
  { key: 'second', label: 'Second one' },
]

const consent = ref(false)
const submitting = ref(false)
const submitError = ref('')
const submitted = ref(false)

const today = new Date().toISOString().slice(0, 10)

onMounted(async () => {
  try {
    const { data } = await invitationsApi.get(inviteId)
    invite.value = data
    submitted.value = data.status === 'submitted'
  } catch (e: unknown) {
    loadError.value = apiErrorMessage(e, 'Failed to load this invitation.')
  } finally {
    loading.value = false
  }
})

function onPhotoChange(slot: Slot, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  submitError.value = ''

  if (file && !ACCEPTED_TYPES.includes(file.type)) {
    submitError.value = 'Photos must be JPEG, PNG or WebP images.'
    input.value = ''
    return
  }
  if (file && file.size > MAX_PHOTO_MB * 1024 * 1024) {
    submitError.value = `Each photo must be ${MAX_PHOTO_MB} MB or smaller.`
    input.value = ''
    return
  }

  if (photos[slot].preview) {
    URL.revokeObjectURL(photos[slot].preview)
  }
  photos[slot].file = file
  photos[slot].preview = file ? URL.createObjectURL(file) : ''
}

const bothPhotosUploaded = computed(() => Boolean(photos.first.file && photos.second.file))
const canSubmit = computed(() => bothPhotosUploaded.value && consent.value && !submitting.value)

async function onSubmit() {
  if (!canSubmit.value || !photos.first.file || !photos.second.file) return
  submitting.value = true
  submitError.value = ''
  try {
    await invitationsApi.submitOnboarding(inviteId, {
      first_name: form.firstName,
      last_name: form.lastName,
      birthday: form.birthday,
      phone: form.phone,
      email: form.email,
      address: form.address,
      website: form.website || undefined,
      photo1: photos.first.file,
      photo2: photos.second.file,
    })
    submitted.value = true
  } catch (e: unknown) {
    submitError.value = apiErrorMessage(e, 'Failed to submit onboarding. Please try again.')
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  if (photos.first.preview) URL.revokeObjectURL(photos.first.preview)
  if (photos.second.preview) URL.revokeObjectURL(photos.second.preview)
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <RouterLink to="/jobs" class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to jobs
    </RouterLink>

    <!-- Loading / errors -->
    <section v-if="loading" class="app-card flex justify-center py-16">
      <span class="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
    </section>

    <section v-else-if="loadError || !invite" class="app-card text-center">
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Invitation not available</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ loadError || 'This invitation could not be found.' }}</p>
      <RouterLink to="/jobs" class="app-btn-primary mt-6">Back to jobs</RouterLink>
    </section>

    <section v-else-if="invite.status === 'cancelled'" class="app-card text-center">
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Invitation cancelled</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">This invitation was cancelled, so onboarding is closed.</p>
      <RouterLink to="/jobs" class="app-btn-primary mt-6">Back to jobs</RouterLink>
    </section>

    <!-- Success state -->
    <section v-else-if="submitted" class="app-card text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">Onboarding submitted</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        We've received your details for the {{ invite.job.required_role }} contract at {{ invite.job.company_name }}.
      </p>
      <RouterLink to="/jobs" class="app-btn-primary mt-6">Back to jobs</RouterLink>
    </section>

    <template v-else>
      <header>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Onboarding</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ invite.job.required_role }} · {{ invite.job.employment_type }} · {{ invite.job.company_name }} ·
          {{ formatLongDate(invite.job.start_date) }} – {{ formatLongDate(invite.job.end_date) }}
        </p>
      </header>

      <form class="app-card space-y-5" @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="auth-label">
            First name
            <input v-model.trim="form.firstName" class="auth-input" type="text" required maxlength="128" autocomplete="given-name" />
          </label>
          <label class="auth-label">
            Last name
            <input v-model.trim="form.lastName" class="auth-input" type="text" required maxlength="128" autocomplete="family-name" />
          </label>
        </div>

        <label class="auth-label">
          Birthday
          <input v-model="form.birthday" class="auth-input" type="date" required :max="today" autocomplete="bday" />
        </label>

        <label class="auth-label">
          Phone number
          <input v-model.trim="form.phone" class="auth-input" type="tel" required minlength="5" maxlength="64" autocomplete="tel" placeholder="+1 555 123 4567" />
        </label>

        <label class="auth-label">
          Email
          <input v-model.trim="form.email" class="auth-input" type="email" required autocomplete="email" placeholder="you@example.com" />
        </label>

        <label class="auth-label">
          Address
          <input v-model.trim="form.address" class="auth-input" type="text" required minlength="3" maxlength="1000" autocomplete="street-address" />
        </label>

        <label class="auth-label">
          Website <span class="font-normal text-slate-400">(optional)</span>
          <input v-model.trim="form.website" class="auth-input" type="url" maxlength="2048" autocomplete="url" placeholder="https://" />
        </label>

        <!-- Photo uploads -->
        <div class="space-y-3">
          <div>
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Please upload your photos</p>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Both images need to be captured from different environments. JPEG, PNG or WebP, up to {{ MAX_PHOTO_MB }} MB each.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div v-for="slot in photoSlots" :key="slot.key">
              <label
                class="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20"
              >
                <img
                  v-if="photos[slot.key].preview"
                  :src="photos[slot.key].preview"
                  :alt="`${slot.label} preview`"
                  class="h-full w-full object-cover"
                />
                <template v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5V18a2 2 0 002 2h14a2 2 0 002-2v-1.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5" />
                  </svg>
                  <span class="text-sm font-medium text-slate-600 dark:text-slate-300">{{ slot.label }}</span>
                  <span class="text-xs text-slate-400">Click to upload</span>
                </template>
                <input type="file" :accept="ACCEPTED_TYPES.join(',')" class="hidden" @change="onPhotoChange(slot.key, $event)" />
              </label>
              <p v-if="photos[slot.key].file" class="mt-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {{ photos[slot.key].file?.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- Confirmation / submit -->
        <div class="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
          <label class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
            <input v-model="consent" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900" />
            <span>
              I confirm the information above is accurate and the photos are my own, captured in different environments.
              I agree that these details and photos are stored and shared with {{ invite.job.company_name }} for onboarding.
            </span>
          </label>

          <p v-if="submitError" class="auth-error">{{ submitError }}</p>

          <button type="submit" class="app-btn-primary w-full !py-3 disabled:cursor-not-allowed disabled:opacity-60" :disabled="!canSubmit">
            {{ submitting ? 'Submitting…' : 'Complete onboarding' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
