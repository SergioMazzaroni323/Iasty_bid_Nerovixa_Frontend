<script setup lang="ts">
import AppLogo from './AppLogo.vue'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="w-full max-w-[420px]">
    <div class="app-card !p-6 sm:!p-8">
      <div class="mb-6 flex flex-col items-center text-center">
        <AppLogo size="lg" />
        <h1 class="mb-2 mt-4 text-[1.75rem] font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="m-0 leading-relaxed text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
      </div>
      <slot />
    </div>
  </div>
</template>
