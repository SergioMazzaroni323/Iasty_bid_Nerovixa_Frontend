import { computed, onUnmounted, ref, toValue, type MaybeRefOrGetter } from 'vue'

const COOLDOWN_SECONDS = 60

export function useResendCooldown(email: MaybeRefOrGetter<string>) {
  const countdown = ref(0)
  let intervalId: ReturnType<typeof setInterval> | null = null

  const storageKey = computed(() => `resend-verify:${toValue(email).toLowerCase()}`)
  const canResend = computed(() => countdown.value === 0)

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function tick() {
    const key = storageKey.value
    if (!key.endsWith(':') && key !== 'resend-verify:') {
      const expiresAt = Number(localStorage.getItem(key) || 0)
      const remaining = Math.ceil((expiresAt - Date.now()) / 1000)
      countdown.value = Math.max(0, remaining)
      if (countdown.value === 0) {
        localStorage.removeItem(key)
        stopTimer()
      }
    } else {
      countdown.value = 0
    }
  }

  function startTimer() {
    stopTimer()
    intervalId = setInterval(tick, 1000)
  }

  function startCooldown() {
    const key = storageKey.value
    if (!toValue(email)) {
      return
    }
    localStorage.setItem(key, String(Date.now() + COOLDOWN_SECONDS * 1000))
    tick()
    startTimer()
  }

  function initCooldown() {
    tick()
    if (countdown.value > 0) {
      startTimer()
    }
  }

  onUnmounted(stopTimer)

  return { countdown, canResend, startCooldown, initCooldown, cooldownSeconds: COOLDOWN_SECONDS }
}
