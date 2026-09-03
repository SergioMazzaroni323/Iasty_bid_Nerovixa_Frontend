<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WorkModeStat } from '../../api/dashboard'

const props = defineProps<{
  items: WorkModeStat[]
}>()

const hovered = ref<string | null>(null)

const LABELS: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  'on-site': 'On-site',
}

const COLORS: Record<string, string> = {
  remote: '#6366f1',
  hybrid: '#8b5cf6',
  'on-site': '#10b981',
}

const total = computed(() => props.items.reduce((sum, item) => sum + item.count, 0))

const segments = computed(() => {
  const sum = total.value || 1
  let offset = 0
  return props.items
    .filter((item) => item.count > 0)
    .map((item) => {
      const pct = item.count / sum
      const segment = {
        work_mode: item.work_mode,
        label: LABELS[item.work_mode] ?? item.work_mode,
        color: COLORS[item.work_mode] ?? '#94a3b8',
        count: item.count,
        pct,
        percent: Math.round(pct * 100),
        dasharray: `${pct * 100} ${100 - pct * 100}`,
        dashoffset: -offset * 100,
      }
      offset += pct
      return segment
    })
})

const activeSegment = computed(() => segments.value.find((segment) => segment.work_mode === hovered.value) ?? null)

function setHovered(workMode: string | null) {
  hovered.value = workMode
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
    <div class="relative h-44 w-44 shrink-0">
      <Transition name="fade">
        <div
          v-if="activeSegment"
          class="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-center shadow-lg dark:bg-slate-100"
        >
          <p class="text-xs font-semibold text-white dark:text-slate-900">{{ activeSegment.label }} jobs</p>
          <p class="text-sm font-bold tabular-nums text-white dark:text-slate-900">
            {{ activeSegment.count }}/{{ activeSegment.percent }}%
          </p>
        </div>
      </Transition>

      <svg viewBox="0 0 42 42" class="h-full w-full -rotate-90">
        <circle
          cx="21"
          cy="21"
          r="15.915"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          class="text-slate-100 dark:text-slate-800"
        />
        <g v-for="segment in segments" :key="segment.work_mode">
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="none"
            stroke="transparent"
            stroke-width="10"
            :stroke-dasharray="segment.dasharray"
            :stroke-dashoffset="segment.dashoffset"
            stroke-linecap="butt"
            class="cursor-pointer"
            @mouseenter="setHovered(segment.work_mode)"
            @mouseleave="setHovered(null)"
          />
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="none"
            :stroke="segment.color"
            :stroke-width="hovered === segment.work_mode ? 5 : 4"
            :stroke-dasharray="segment.dasharray"
            :stroke-dashoffset="segment.dashoffset"
            stroke-linecap="butt"
            class="pointer-events-none transition-all duration-150"
            :class="hovered && hovered !== segment.work_mode ? 'opacity-45' : 'opacity-100'"
          />
        </g>
      </svg>

      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ total }}</span>
        <span class="text-xs text-slate-500 dark:text-slate-400">jobs</span>
      </div>
    </div>

    <ul class="w-full space-y-3 sm:w-auto sm:min-w-[10rem]">
      <li
        v-for="item in items"
        :key="item.work_mode"
        class="flex cursor-default items-center justify-between gap-4 rounded-lg px-1 py-0.5 text-sm transition"
        :class="hovered === item.work_mode ? 'bg-slate-50 dark:bg-slate-800/60' : ''"
        @mouseenter="setHovered(item.work_mode)"
        @mouseleave="setHovered(null)"
      >
        <span class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span
            class="inline-block h-3 w-3 rounded-full"
            :style="{ backgroundColor: COLORS[item.work_mode] ?? '#94a3b8' }"
          />
          {{ LABELS[item.work_mode] ?? item.work_mode }}
        </span>
        <span class="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {{ item.count }}
          <span class="font-normal text-slate-400 dark:text-slate-500">
            ({{ total ? Math.round((item.count / total) * 100) : 0 }}%)
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
