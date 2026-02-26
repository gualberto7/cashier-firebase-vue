<script setup lang="ts">
import { PencilIcon, TrashIcon, ArrowDownCircleIcon } from '@heroicons/vue/24/outline'
import type { SavingsBox } from '@/types'
import { formatCurrency } from '@/utils/currency'

interface Props {
  box: SavingsBox
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [box: SavingsBox]
  delete: [box: SavingsBox]
  withdraw: [box: SavingsBox]
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="p-5">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: box.color }"
          />
          <div>
            <h3 class="font-semibold text-gray-900">{{ box.name }}</h3>
            <p class="text-sm text-gray-500">{{ box.targetPercentage }}% de ingresos</p>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <span
            v-if="!box.isActive"
            class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
          >
            Inactiva
          </span>
          <button
            class="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600"
            title="Retirar"
            :disabled="box.currentBalance <= 0"
            @click="emit('withdraw', box)"
          >
            <ArrowDownCircleIcon class="h-4 w-4" />
          </button>
          <button
            class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            @click="emit('edit', box)"
          >
            <PencilIcon class="h-4 w-4" />
          </button>
          <button
            class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
            @click="emit('delete', box)"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="mt-4">
        <p class="text-2xl font-bold text-gray-900">
          {{ formatCurrency(box.currentBalance) }}
        </p>
        <p class="text-sm text-gray-500">Balance actual</p>
      </div>
    </div>

    <!-- Progress bar (percentage indicator) -->
    <div class="h-1.5" :style="{ backgroundColor: box.color + '20' }">
      <div
        class="h-full transition-all duration-300"
        :style="{
          backgroundColor: box.color,
          width: `${box.targetPercentage}%`
        }"
      />
    </div>
  </div>
</template>
