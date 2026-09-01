<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import PasswordInput from '../components/PasswordInput.vue'
import ResendVerification from '../components/ResendVerification.vue'
import { authApi } from '../api/client'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showUnverified = ref(false)

async function onSubmit() {
  error.value = ''
  showUnverified.value = false
  loading.value = true
  try {
    const { data } = await authApi.login(email.value, password.value)
    localStorage.setItem('access_token', data.access_token)
    await router.push({ name: 'home' })
  } catch (e: unknown) {
    const err = e as { response?: { status?: number; data?: { detail?: string } } }
    if (err.response?.status === 403) {
      showUnverified.value = true
      error.value = err.response?.data?.detail ?? 'Email not verified.'
    } else {
      error.value = err.response?.data?.detail ?? 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="Welcome back" subtitle="Sign in to your Iasty Bid account">
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="auth-label">
        Email
        <input v-model="email" class="auth-input" type="email" required autocomplete="email" placeholder="you@gmail.com" />
      </label>

      <label class="auth-label">
        Password
        <PasswordInput v-model="password" autocomplete="current-password" placeholder="••••••••" required />
      </label>

      <div class="-mt-1 text-right">
        <RouterLink class="auth-link" to="/forgot-password">Forgot password?</RouterLink>
      </div>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <ResendVerification v-if="showUnverified" :email="email" />

      <button class="auth-btn" type="submit" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>

    <p class="mt-6 text-center text-slate-500 dark:text-slate-400">
      Don't have an account?
      <RouterLink class="auth-link" to="/register">Register</RouterLink>
    </p>
  </AuthLayout>
</template>
