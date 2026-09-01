<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { authApi } from '../api/client'
import { useResendCooldown } from '../composables/useResendCooldown'

const props = defineProps<{
  email: string
  autoCooldown?: boolean
}>()

const resendMessage = ref('')
const resendError = ref('')
const resending = ref(false)

const { countdown, canResend, startCooldown, initCooldown } = useResendCooldown(() => props.email)

watch(
  () => props.email,
  () => {
    resendMessage.value = ''
    resendError.value = ''
    initCooldown()
  },
)

onMounted(() => {
  initCooldown()
  if (props.autoCooldown && canResend.value) {
    startCooldown()
  }
})

async function resendVerification() {
  if (!props.email || !canResend.value || resending.value) {
    return
  }

  resendMessage.value = ''
  resendError.value = ''
  resending.value = true

  try {
    const { data } = await authApi.resendVerification(props.email)
    resendMessage.value = data.message
    startCooldown()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: string } } }
    resendError.value = err.response?.data?.detail ?? 'Failed to send verification link.'
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="rounded-[10px] border border-amber-200 bg-amber-50 p-4">
    <p class="mb-3 text-sm leading-relaxed text-amber-900">
      Your email is not verified yet. Check your inbox or request a new verification link.
    </p>

    <p v-if="resendMessage" class="mb-3 text-sm text-green-700">{{ resendMessage }}</p>
    <p v-if="resendError" class="auth-error mb-3">{{ resendError }}</p>

    <button
      type="button"
      class="auth-btn-secondary w-full"
      :disabled="!canResend || resending || !email"
      @click="resendVerification"
    >
      <span v-if="resending">Sending...</span>
      <span v-else-if="!canResend">Resend in {{ countdown }}s</span>
      <span v-else>Send verification link again</span>
    </button>

    <p class="mt-2 text-center text-xs text-amber-800">
      Please check your <strong>spam</strong> folder if you don't see the email.
    </p>
  </div>
</template>
