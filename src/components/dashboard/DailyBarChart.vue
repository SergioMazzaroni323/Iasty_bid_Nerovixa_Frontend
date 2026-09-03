<script setup lang="ts">
import { computed } from 'vue'
import type { DailyCount } from '../../api/dashboard'

const props = withDefaults(
  defineProps<{
    items: DailyCount[]
    color?: string
    emptyLabel?: string
  }>(),
  {
    color: '#6366f1',
    emptyLabel: 'No activity yet',
  },
)

const maxCount = computed(() => Math.max(1, ...props.items.map((item) => item.count)))
const total = computed(() => props.items.reduce((sum, item) => sum + item.count, 0))

function formatLabel(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function barHeight(count: number) {
  return `${Math.max((count / maxCount.value) * 100, count > 0 ? 8 : 0)}%`
}
</script>

<template>
  <div>
    <div v-if="total === 0" class="flex h-48 flex-col items-center justify-center gap-2 text-center">
      <div class="flex h-24 w-full items-end justify-center gap-1.5 px-2 opacity-40">
        <span
          v-for="(_, index) in items"
          :key="index"
          class="w-full max-w-[1.25rem] rounded-t-md bg-slate-200 dark:bg-slate-700"
          :style="{ height: `${12 + (index % 5) * 4}%` }"
        />
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ emptyLabel }}</p>
    </div>

    <div v-else class="space-y-3">
      <div class="flex h-48 items-end gap-1 sm:gap-1.5">
        <div
          v-for="item in items"
          :key="item.date"
          class="group flex min-w-0 flex-1 flex-col items-center gap-2"
        >
          <span
            class="pointer-events-none rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900"
          >
            {{ item.count }}
          </span>
          <div class="flex h-36 w-full items-end justify-center">
            <span
              class="w-full max-w-[1.75rem] rounded-t-md transition-all duration-300 group-hover:opacity-90"
              :style="{ height: barHeight(item.count), backgroundColor: color }"
            />
          </div>
          <span class="truncate text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
            {{ formatLabel(item.date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
