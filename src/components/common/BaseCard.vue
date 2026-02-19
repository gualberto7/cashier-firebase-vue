<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  padding?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: true
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200">
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-200">
      <slot name="header">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
      </slot>
    </div>
    <div :class="padding ? 'p-6' : ''">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
      <slot name="footer" />
    </div>
  </div>
</template>
