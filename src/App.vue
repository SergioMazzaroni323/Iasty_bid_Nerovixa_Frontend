<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LoginLanding from './components/LoginLanding.vue'

const route = useRoute()
const useAuthShell = computed(() => Boolean(route.meta.guest))
const isLoginLanding = computed(() => route.name === 'login')
</script>

<template>
  <LoginLanding v-if="useAuthShell && isLoginLanding">
    <RouterView />
  </LoginLanding>
  <div
    v-else-if="useAuthShell"
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
  >
    <RouterView />
  </div>
  <RouterView v-else />
</template>
