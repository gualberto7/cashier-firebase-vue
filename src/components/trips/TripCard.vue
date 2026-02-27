<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Trip } from '@/types'
import { formatCurrency } from '@/utils/currency'

interface Props {
  trip: Trip
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  total: 0
})

const emit = defineEmits<{
  edit: [trip: Trip]
  delete: [trip: Trip]
}>()

function formatTripDate(date: Date): string {
  return format(date, "d MMM yyyy", { locale: es })
}

const dateRange = computed(() => {
  const start = formatTripDate(props.trip.startDate)
  const end = props.trip.endDate ? formatTripDate(props.trip.endDate) : 'en curso'
  return `${start} – ${end}`
})

const isActive = computed(() => {
  if (!props.trip.endDate) return true
  return props.trip.endDate >= new Date()
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Color bar -->
    <div class="h-1.5" :style="{ backgroundColor: trip.color }" />

    <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-semibold text-gray-900 truncate">{{ trip.name }}</h3>
            <span
              :class="[
                'shrink-0 text-xs font-medium px-2 py-0.5 rounded-full',
                isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ isActive ? 'Activo' : 'Completado' }}
            </span>
          </div>

          <p class="text-sm text-gray-500 mb-2">{{ dateRange }}</p>

          <p v-if="trip.description" class="text-sm text-gray-600 truncate">{{ trip.description }}</p>
        </div>

        <div class="text-right shrink-0">
          <p class="text-lg font-bold text-red-600">{{ formatCurrency(total) }}</p>
          <p class="text-xs text-gray-400">total gastado</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
        <RouterLink
          :to="{ name: 'trip-detail', params: { id: trip.id } }"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
        >
          <EyeIcon class="h-3.5 w-3.5" />
          Ver
        </RouterLink>
        <button
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          @click="emit('edit', trip)"
        >
          <PencilIcon class="h-4 w-4" />
        </button>
        <button
          class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          @click="emit('delete', trip)"
        >
          <TrashIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
