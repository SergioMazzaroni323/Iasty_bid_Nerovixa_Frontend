<script setup lang="ts">
import LoginBackdrop from './LoginBackdrop.vue'
import ThemeToggle from './ThemeToggle.vue'

const highlights = [
  {
    title: 'Track every job',
    body: 'Filter, sort, and keep your pipeline in one place.',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'Draft stronger bids',
    body: 'Turn listings into proposals that sound like you.',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z',
  },
  {
    title: 'Stay one step ahead',
    body: 'See what is open, submitted, and ready to win.',
    icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  },
]
</script>

<template>
  <div
    class="relative min-h-screen overflow-hidden bg-[#eef2ff] dark:bg-[#070b14]"
  >
    <LoginBackdrop />

    <div class="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
      <section class="flex flex-col justify-center px-5 pb-4 pt-10 text-center sm:px-8 lg:px-16 lg:text-left">
        <p
          class="inline-flex items-center justify-center gap-2 self-center rounded-full border border-indigo-200/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 shadow-sm backdrop-blur dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:text-indigo-300 lg:self-start"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.9)]" />
          Nerovixa
        </p>

        <h1 class="mt-5 text-[2.35rem] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
          <span
            class="bg-gradient-to-r from-indigo-700 via-violet-600 to-sky-500 bg-clip-text text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-sky-300"
          >
            AI Bid Assister
          </span>
        </h1>

        <p class="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg lg:mx-0">
          Win more work with a calmer pipeline — track jobs, shape proposals, and keep every bid moving.
        </p>

        <ul class="mx-auto mt-8 hidden max-w-md space-y-3 text-left lg:mx-0 lg:block">
          <li
            v-for="item in highlights"
            :key="item.title"
            class="flex gap-3 rounded-2xl border border-white/70 bg-white/55 p-3.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/45"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
            </span>
            <span>
              <span class="block text-sm font-semibold text-slate-900 dark:text-slate-100">{{ item.title }}</span>
              <span class="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{{ item.body }}</span>
            </span>
          </li>
        </ul>
      </section>

      <section class="flex items-center justify-center px-4 pb-24 pt-2 sm:px-8 lg:p-10 lg:pb-24">
        <div class="relative w-full max-w-[420px]">
          <div
            class="login-card-glow absolute -inset-[2px] rounded-[1.6rem] bg-gradient-to-br from-indigo-400 via-violet-400 to-sky-400 opacity-90 blur-[2px] dark:from-indigo-500 dark:via-violet-500 dark:to-sky-400"
          />
          <div class="relative">
            <slot />
          </div>
        </div>
      </section>
    </div>

    <div class="absolute bottom-4 right-4 z-30 sm:bottom-6 sm:right-6">
      <ThemeToggle variant="compact" />
    </div>
  </div>
</template>

<style scoped>
.login-card-glow {
  background-size: 200% 200%;
  animation: glow-shift 7s ease infinite;
}

@keyframes glow-shift {
  0%,
  100% {
    background-position: 0% 50%;
    opacity: 0.75;
  }
  50% {
    background-position: 100% 50%;
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-card-glow {
    animation: none;
  }
}
</style>
