<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import ResendVerification from '../components/ResendVerification.vue'

const route = useRoute()
const email = computed(() => (route.query.email as string) || '')
</script>

<template>
  <AuthLayout title="Check your Gmail">
    <div class="py-4 text-center">
      <div class="mb-4 text-5xl">✉️</div>
      <p class="mb-4 leading-relaxed text-slate-900">
        Verification link sent to <strong>{{ email || 'your Gmail' }}</strong>.
      </p>
      <p class="mb-3 leading-relaxed text-slate-500">
        Please open the email and click the verification link to activate your account.
      </p>
      <p class="auth-spam-alert">
        Didn't receive it? Please check your <strong>spam</strong> or <strong>promotions</strong> folder.
      </p>
    </div>

    <ResendVerification v-if="email" class="mt-4" :email="email" auto-cooldown />

    <RouterLink class="auth-link mt-6 block text-center" to="/login">Back to login</RouterLink>
  </AuthLayout>
</template>
