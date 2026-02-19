<script setup lang="ts">
import { FolderOpenIcon } from '@heroicons/vue/24/outline'

interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: 'No hay datos',
  description: 'Comienza agregando un nuevo registro'
})
</script>

<template>
  <div class="text-center py-12">
    <slot name="icon">
      <FolderOpenIcon class="mx-auto h-12 w-12 text-gray-400" />
    </slot>
    <h3 class="mt-4 text-sm font-medium text-gray-900">{{ title }}</h3>
    <p class="mt-1 text-sm text-gray-500">{{ description }}</p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>
