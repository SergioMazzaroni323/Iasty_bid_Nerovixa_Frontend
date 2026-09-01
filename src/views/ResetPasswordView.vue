<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import { authApi } from '../api/client'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const success = ref(false)

const token = route.query.token as string

async function onSubmit() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  if (!token) {
    error.value = 'Invalid reset link.'
    return
  }

  loading.value = true
  try {
    await authApi.resetPassword(token, password.value)
    success.value = true
    setTimeout(() => router.push({ name: 'login' }), 2500)
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } } }
    error.value = err.response?.data?.detail ?? 'Reset failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="Reset password" subtitle="Choose a new password for your account">
    <form v-if="!success" class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="auth-label">
        New password
        <input v-model="password" class="auth-input" type="password" required minlength="8" autocomplete="new-password" />
      </label>

      <label class="auth-label">
        Confirm password
        <input v-model="confirmPassword" class="auth-input" type="password" required minlength="8" autocomplete="new-password" />
      </label>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <button class="auth-btn" type="submit" :disabled="loading">
        {{ loading ? 'Saving...' : 'Reset password' }}
      </button>
    </form>

    <p v-else class="text-center text-green-700">Password reset successfully. Redirecting to login...</p>

    <RouterLink class="auth-link mt-6 block text-center" to="/login">Back to login</RouterLink>
  </AuthLayout>
</template>
