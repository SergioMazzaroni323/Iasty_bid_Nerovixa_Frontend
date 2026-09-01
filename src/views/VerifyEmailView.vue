<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import { authApi } from '../api/client'

const route = useRoute()
const router = useRouter()
const message = ref('Verifying your email...')
const error = ref('')
const success = ref(false)

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    error.value = 'Invalid verification link.'
    return
  }

  try {
    const { data } = await authApi.verifyEmail(token)
    message.value = data.message
    success.value = true
    setTimeout(() => router.push({ name: 'login' }), 3000)
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } } }
    error.value = err.response?.data?.detail ?? 'Verification failed.'
  }
})
</script>

<template>
  <AuthLayout :title="success ? 'Email verified' : error ? 'Verification failed' : 'Verifying...'">
    <div class="text-center">
      <p v-if="success" class="text-green-700">{{ message }}</p>
      <p v-else-if="error" class="auth-error">{{ error }}</p>
      <p v-else class="text-slate-500">{{ message }}</p>
      <RouterLink v-if="error || success" class="auth-link mt-4 inline-block" to="/login">Go to login</RouterLink>
    </div>
  </AuthLayout>
</template>
