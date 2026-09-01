<script setup lang="ts">
import { useTheme, type ThemeMode } from '../composables/useTheme'

const { theme, setTheme } = useTheme()

const options: { id: ThemeMode; label: string; icon: string }[] = [
  {
    id: 'light',
    label: 'Light theme',
    icon: 'M12 3v2.25M12 18.75V21M4.22 4.22l1.59 1.59M18.19 18.19l1.59 1.59M3 12h2.25M18.75 12H21M4.22 19.78l1.59-1.59M18.19 5.81l1.59-1.59M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z',
  },
  {
    id: 'dark',
    label: 'Dark theme',
    icon: 'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z',
  },
]
</script>

<template>
  <div
    class="inline-flex rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80"
    role="group"
    aria-label="Theme"
  >
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition"
      :class="
        theme === option.id
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
      "
      :aria-pressed="theme === option.id"
      :title="option.label"
      @click="setTheme(option.id)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" :d="option.icon" />
      </svg>
      <span class="hidden sm:inline">{{ option.id === 'light' ? 'Light' : 'Dark' }}</span>
    </button>
  </div>
</template>
