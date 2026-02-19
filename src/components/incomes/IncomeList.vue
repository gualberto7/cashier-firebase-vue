<script setup lang="ts">
import { PencilIcon, TrashIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Income } from '@/types'
import { BaseEmpty } from '@/components/common'

interface Props {
  incomes: Income[]
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [income: Income]
  delete: [income: Income]
}>()

const expandedIncomeId = ref<string | null>(null)

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function formatDate(date: Date): string {
  return format(date, "d 'de' MMM, yyyy", { locale: es })
}

function toggleExpand(incomeId: string) {
  expandedIncomeId.value = expandedIncomeId.value === incomeId ? null : incomeId
}
</script>

<template>
  <div>
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-100 rounded-lg h-16" />
    </div>

    <BaseEmpty
      v-else-if="incomes.length === 0"
      title="No hay ingresos"
      description="Comienza agregando tu primer ingreso"
    />

    <div v-else class="space-y-2">
      <div
        v-for="income in incomes"
        :key="income.id"
        class="bg-white rounded-lg border border-gray-200"
      >
        <div class="flex items-center justify-between p-4">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 truncate">{{ income.description }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span
                v-if="income.isDistributed"
                class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700"
              >
                Distribuido
              </span>
              <span class="text-xs text-gray-500">{{ formatDate(income.date) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 ml-4">
            <span class="font-semibold text-green-600">
              +{{ formatCurrency(income.amount) }}
            </span>

            <div class="flex items-center gap-1">
              <button
                v-if="income.distributions.length > 0"
                class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                @click="toggleExpand(income.id)"
              >
                <ChevronDownIcon
                  class="h-4 w-4 transition-transform"
                  :class="{ 'rotate-180': expandedIncomeId === income.id }"
                />
              </button>
              <button
                class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                @click="emit('edit', income)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                class="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                @click="emit('delete', income)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Distribution details -->
        <div
          v-if="expandedIncomeId === income.id && income.distributions.length > 0"
          class="px-4 pb-4"
        >
          <div class="bg-gray-50 rounded-lg p-3 space-y-2">
            <p class="text-xs font-medium text-gray-500 uppercase">Distribución</p>
            <div
              v-for="dist in income.distributions"
              :key="dist.boxId"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-700">{{ dist.boxName }} ({{ dist.percentage }}%)</span>
              <span class="font-medium text-gray-900">{{ formatCurrency(dist.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
