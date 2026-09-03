<script setup lang="ts">
import { computed } from 'vue'
import type { DailyCount } from '../../api/dashboard'

const props = withDefaults(
  defineProps<{
    items: DailyCount[]
    color?: string
    minY?: number
    maxY?: number
  }>(),
  {
    color: '#6366f1',
    minY: 0,
  },
)

const padding = { top: 12, right: 12, bottom: 28, left: 36 }
const width = 320
const height = 180

const counts = computed(() => props.items.map((item) => item.count))

const yMin = computed(() => {
  const dataMin = Math.min(...counts.value)
  const floor = props.minY ?? 0
  return Math.max(floor, dataMin - 4)
})

const yMax = computed(() => {
  if (props.maxY !== undefined) return props.maxY
  return Math.max(...counts.value) + 4
})

const points = computed(() => {
  if (props.items.length === 0) return []

  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const range = yMax.value - yMin.value || 1

  return props.items.map((item, index) => {
    const x = padding.left + (index / Math.max(props.items.length - 1, 1)) * innerW
    const y = padding.top + innerH - ((item.count - yMin.value) / range) * innerH
    return { x, y, count: item.count, date: item.date }
  })
})

const linePath = computed(() => {
  if (points.value.length === 0) return ''
  return points.value.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
})

const yTicks = computed(() => {
  const range = yMax.value - yMin.value
  const step = range <= 12 ? 2 : 5
  const ticks: number[] = []
  const start = Math.ceil(yMin.value / step) * step
  for (let value = start; value <= yMax.value; value += step) {
    ticks.push(value)
  }
  return ticks
})

function tickY(value: number) {
  const innerH = height - padding.top - padding.bottom
  const range = yMax.value - yMin.value || 1
  return padding.top + innerH - ((value - yMin.value) / range) * innerH
}

function formatLabel(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatShortLabel(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="w-full">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="h-48 w-full"
      role="img"
      aria-label="Daily activity line chart"
    >
      <line
        v-for="tick in yTicks"
        :key="tick"
        :x1="padding.left"
        :y1="tickY(tick)"
        :x2="width - padding.right"
        :y2="tickY(tick)"
        class="stroke-slate-200 dark:stroke-slate-700"
        stroke-width="1"
        stroke-dasharray="3 3"
      />

      <text
        v-for="tick in yTicks"
        :key="`label-${tick}`"
        :x="padding.left - 6"
        :y="tickY(tick) + 4"
        text-anchor="end"
        class="fill-slate-400 text-[9px] dark:fill-slate-500"
      >
        {{ tick }}
      </text>

      <path
        v-if="linePath"
        :d="linePath"
        fill="none"
        :stroke="color"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <g v-for="point in points" :key="point.date">
        <circle
          :cx="point.x"
          :cy="point.y"
          r="5"
          :fill="color"
          class="opacity-90"
        />
        <circle
          :cx="point.x"
          :cy="point.y"
          r="8"
          fill="white"
          class="opacity-0 transition hover:opacity-100 dark:fill-slate-900"
        />
        <title>{{ formatLabel(point.date) }}: {{ point.count }}</title>
        <text
          :x="point.x"
          :y="height - 6"
          text-anchor="middle"
          class="fill-slate-500 text-[8px] dark:fill-slate-400"
        >
          {{ formatShortLabel(point.date) }}
        </text>
        <text
          :x="point.x"
          :y="point.y - 10"
          text-anchor="middle"
          class="fill-slate-700 text-[9px] font-semibold dark:fill-slate-200"
        >
          {{ point.count }}
        </text>
      </g>
    </svg>
  </div>
</template>
