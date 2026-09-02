<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    theme?: 'auto' | 'light' | 'dark'
  }>(),
  { size: 'md', theme: 'auto' },
)

const { isDark } = useTheme()

const logoSrc = computed(() => {
  if (props.theme === 'light') return '/logo_black.png'
  if (props.theme === 'dark') return '/logo_white.png'
  return isDark.value ? '/logo_white.png' : '/logo_black.png'
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-6'
  if (props.size === 'lg') return 'h-10'
  return 'h-8'
})
</script>

<template>
  <img :src="logoSrc" alt="Nerovixa" class="w-auto object-contain" :class="sizeClass" />
</template>
