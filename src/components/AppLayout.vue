<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi, type UserResponse } from '../api/client'
import AppLogo from './AppLogo.vue'

const route = useRoute()
const router = useRouter()
const user = ref<UserResponse | null>(null)
const mobileMenuOpen = ref(false)

const navItems = [
  {
    name: 'home',
    label: 'Dashboard',
    to: '/home',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    name: 'jobs',
    label: 'Jobs',
    to: '/jobs',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    name: 'settings',
    label: 'Settings',
    to: '/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

const pageTitle = computed(() => {
  const item = navItems.find((entry) => entry.name === route.name)
  return item?.label ?? 'Nerovixa'
})

onMounted(async () => {
  try {
    const { data } = await authApi.me()
    user.value = data
  } catch {
    localStorage.removeItem('access_token')
    await router.push({ name: 'login' })
  }
})

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

function logout() {
  localStorage.removeItem('access_token')
  router.push({ name: 'login' })
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function navClass(active: boolean) {
  return active
    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
}
</script>

<template>
  <div class="min-h-screen lg:pl-64">
    <!-- Desktop sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:flex"
    >
      <div class="border-b border-slate-200/80 px-6 py-6 dark:border-slate-800">
        <AppLogo size="lg" />
        <p class="mt-2 text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
          Job tracking platform
        </p>
      </div>

      <nav class="flex-1 space-y-1.5 p-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition"
          :class="navClass(route.name === item.name)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          {{ item.label }}
        </RouterLink>
      </nav>

      <div v-if="user" class="border-t border-slate-200/80 p-4 dark:border-slate-800">
        <div class="rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-900">
          <p class="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{{ user.email }}</p>
          <button
            type="button"
            class="mt-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            @click="logout"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        @click="mobileMenuOpen = false"
      />
    </Transition>

    <!-- Mobile drawer -->
    <Transition name="slide">
      <aside
        v-if="mobileMenuOpen"
        class="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 lg:hidden"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <AppLogo size="md" />
          <button
            type="button"
            class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
            @click="mobileMenuOpen = false"
          >
            ✕
          </button>
        </div>

        <nav class="flex-1 space-y-1.5 p-4">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition"
            :class="navClass(route.name === item.name)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
            </svg>
            {{ item.label }}
          </RouterLink>
        </nav>

        <div v-if="user" class="border-t border-slate-200 p-4 dark:border-slate-800">
          <p class="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{{ user.email }}</p>
          <button type="button" class="mt-2 text-sm font-medium text-slate-500" @click="logout">Sign out</button>
        </div>
      </aside>
    </Transition>

    <div class="flex min-h-screen min-w-0 flex-col pb-16 lg:pb-0">
      <header
        class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/80"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open menu"
            @click="toggleMobileMenu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="min-w-0 flex-1">
            <h2 class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
              {{ pageTitle }}
            </h2>
            <p class="hidden text-sm text-slate-500 sm:block dark:text-slate-400">
              Manage your job search pipeline
            </p>
          </div>

          <div v-if="$slots['header-actions']" class="shrink-0">
            <slot name="header-actions" />
          </div>
        </div>
      </header>

      <main class="flex-1 p-3 sm:p-5 lg:p-8">
        <slot />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav
      class="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200/80 bg-white/90 px-2 py-2 backdrop-blur-xl safe-bottom dark:border-slate-800 dark:bg-slate-950/90 lg:hidden"
      aria-label="Main navigation"
    >
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium transition"
        :class="route.name === item.name ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
        </svg>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.safe-bottom {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}
</style>
