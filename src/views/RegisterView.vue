<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import PasswordInput from '../components/PasswordInput.vue'
import { authApi } from '../api/client'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    await authApi.register(email.value, password.value)
    await router.push({ name: 'register-sent', query: { email: email.value } })
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } } }
    error.value = err.response?.data?.detail ?? 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="Create account" subtitle="Register with your Gmail address">
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="auth-label">
        Email
        <input v-model="email" class="auth-input" type="email" required autocomplete="email" placeholder="you@gmail.com" />
      </label>

      <label class="auth-label">
        Password
        <PasswordInput v-model="password" autocomplete="new-password" placeholder="At least 8 characters" :minlength="8" required />
      </label>

      <label class="auth-label">
        Confirm password
        <PasswordInput v-model="confirmPassword" autocomplete="new-password" placeholder="Repeat password" :minlength="8" required />
      </label>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <button class="auth-btn" type="submit" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>
    </form>

    <p class="mt-6 text-center text-slate-500 dark:text-slate-400">
      Already have an account?
      <RouterLink class="auth-link" to="/login">Sign in</RouterLink>
    </p>
  </AuthLayout>
</template>
