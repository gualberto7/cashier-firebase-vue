<script setup lang="ts">
import { computed } from 'vue'
import type { IncomeDistribution } from '@/types'
import { formatCurrency } from '@/utils/currency'

interface Props {
  distributions: IncomeDistribution[]
  total: number
}

const props = defineProps<Props>()

const totalDistributed = computed(() =>
  props.distributions.reduce((sum, d) => sum + d.amount, 0)
)

const remainder = computed(() => props.total - totalDistributed.value)
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <h4 class="font-medium text-gray-900">Vista previa de distribución</h4>
    </div>

    <div class="divide-y divide-gray-100">
      <div
        v-for="distribution in distributions"
        :key="distribution.boxId"
        class="px-4 py-3 flex items-center justify-between"
      >
        <div>
          <p class="font-medium text-gray-900">{{ distribution.boxName }}</p>
          <p class="text-sm text-gray-500">{{ distribution.percentage }}%</p>
        </div>
        <span class="font-semibold text-green-600">
          +{{ formatCurrency(distribution.amount) }}
        </span>
      </div>

      <div
        v-if="remainder > 0"
        class="px-4 py-3 flex items-center justify-between bg-gray-50"
      >
        <div>
          <p class="font-medium text-gray-900">Sin asignar</p>
          <p class="text-sm text-gray-500">Disponible</p>
        </div>
        <span class="font-semibold text-gray-600">
          {{ formatCurrency(remainder) }}
        </span>
      </div>
    </div>

    <div class="px-4 py-3 bg-primary-50 border-t border-primary-100 flex items-center justify-between">
      <span class="font-medium text-primary-900">Total distribuido</span>
      <span class="font-bold text-primary-700">
        {{ formatCurrency(totalDistributed) }}
      </span>
    </div>
  </div>
</template>
