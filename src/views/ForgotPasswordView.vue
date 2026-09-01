<script setup lang="ts">
import { ref } from 'vue'
import AuthLayout from '../components/AuthLayout.vue'
import { authApi } from '../api/client'

const email = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

async function onSubmit() {
  error.value = ''
  message.value = ''
  loading.value = true
  try {
    const { data } = await authApi.forgotPassword(email.value)
    message.value = data.message
    sent.value = true
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } } }
    error.value = err.response?.data?.detail ?? 'Request failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="Forgot password" subtitle="We'll send a reset link to your Gmail">
    <form v-if="!sent" class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="auth-label">
        Email
        <input v-model="email" class="auth-input" type="email" required autocomplete="email" placeholder="you@gmail.com" />
      </label>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <button class="auth-btn" type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send reset link' }}
      </button>
    </form>

    <div v-else>
      <p class="mb-3 leading-relaxed text-slate-700">{{ message }}</p>
      <p class="auth-spam-alert">
        Please also check your <strong>spam</strong> folder if you don't see the email.
      </p>
    </div>

    <RouterLink class="auth-link mt-6 block text-center" to="/login">Back to login</RouterLink>
  </AuthLayout>
</template>
