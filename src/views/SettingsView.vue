<script setup lang="ts">
import ThemeToggle from '../components/ThemeToggle.vue'
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <section class="app-card">
      <h3 class="app-card-title">Appearance</h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Choose light or dark theme for the platform.
      </p>
      <div class="mt-5">
        <ThemeToggle />
      </div>
      <p class="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
        Your preference is saved on this device.
      </p>
    </section>

    <section class="app-card">
      <h3 class="app-card-title">Account</h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Manage your profile and application preferences.
      </p>
      <dl class="mt-5 space-y-3 text-sm">
        <div class="flex justify-between gap-4 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-950">
          <dt class="text-slate-500 dark:text-slate-400">Email notifications</dt>
          <dd class="font-medium text-slate-800 dark:text-slate-200">Enabled</dd>
        </div>
        <div class="flex justify-between gap-4 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-950">
          <dt class="text-slate-500 dark:text-slate-400">Default work mode</dt>
          <dd class="font-medium text-slate-800 dark:text-slate-200">Remote / Hybrid</dd>
        </div>
        <div class="flex justify-between gap-4 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-950">
          <dt class="text-slate-500 dark:text-slate-400">Extension sync</dt>
          <dd class="font-medium text-amber-600 dark:text-amber-400">Coming soon</dd>
        </div>
      </dl>
    </section>

    <section class="app-card lg:col-span-2">
      <h3 class="app-card-title">Jobs</h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        View, filter, and sort all tracked job postings in one place.
      </p>
      <RouterLink to="/jobs" class="app-btn-primary mt-5">Open Jobs page</RouterLink>
    </section>
  </div>
</template>
